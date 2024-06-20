import { NextFunction, Request, Response } from "express";
import {IAuthController} from './auth.interface'
import { AuthDTO , SignInDTO} from "./auth.dto";
import DataBase from "../../../db/db-connection";
import { ResultSetHeader } from "mysql2";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const db = new DataBase().connectToDB()
class AuthController implements IAuthController {
    async SignIn(req: Request, res: Response, next: NextFunction): Promise<void> {
        const data: SignInDTO = req.body
        
        const isUserFoundByEmailQuery = `select * from auth where email = ?`
        const updateLoggedInQuery = `update auth set isLoggedIn = true where id = ?`

        const userFound = await new Promise<AuthDTO[]>((resolve,reject)=>{
            db.execute(isUserFoundByEmailQuery , [data.email],(err,result:[],fields)=>{
                if(err){
                    return next({message:'Query execution failed',status:500})
                }
                if(result.length==0){
                    return next({message:'Invalid credentials',status:404})
                }
                resolve(result)
            })
        })
        
        const checkPasswordValid = bcrypt.compareSync(data.password, userFound[0].password)
        if(!checkPasswordValid){
            return next({message:'Invalid credentials'})
        }

        const token = jwt.sign({id:userFound[0].id,email:userFound[0].email,isLoggedIn:userFound[0].isLoggedIn}, 
            process.env.SECRET_KEY!)
        
        db.execute(updateLoggedInQuery,[userFound[0].id],(err,result:ResultSetHeader,fields)=>{
            if(err){
                return next({message:'Query execution failed',status:500})
            }
            if(result.affectedRows == 1){
                return res.status(200).json({message:'Logged in successfully',token})
            }
        })
    }
    Register(req: Request, res: Response, next: NextFunction): void {
        const data:AuthDTO = req.body

        const checkIsEmailExistQuery = `select * from auth where email = ?`
        const insertQuery = `insert into auth (username,email,password,phone,address,age) values (?,?,?,?,?,?)`

        db.execute(checkIsEmailExistQuery, [data.email],(err,result:[],fields)=>{
            if(err){
                return next({message:'Query execution failed',status:500})
            }
            if(result.length>0){
                return next({message:'This email already used before',status:409})
            }
        })

        const hashedPassword:string = bcrypt.hashSync(data.password, parseInt(process.env.SAULT_ROUNDS!))
        
        db.execute(insertQuery,[data.username,data.email,hashedPassword,data.phone,data.address,data.age],
            (err,result:ResultSetHeader,fields)=>{
                if(err){
                    return next(err)
                }
                if(result.affectedRows==1){
                    return res.status(201).json({message:'Registration process is done..'})
                }
            }
        )
    }
}

export default AuthController