import { NextFunction, Request, Response } from "express";
import {IAuthController} from './auth.interface'
import { AuthDTO , SignInDTO} from "./auth.dto";
import DataBase from "../../../db/db-connection";
import { ResultSetHeader } from "mysql2";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const db = new DataBase().connectToDB()
class AuthController implements IAuthController {
    async AllUsers(req: Request|any, res: Response, next: NextFunction): Promise<void> {
        const {id} = req.authUser
        const getAllUsersQuery = `select username,email,age,address,phone from auth where id <> ?`

        try {
            const allUsers = await new Promise<AuthDTO[]>((resolve,reject)=>{
                db.execute(getAllUsersQuery,[id],(err,result:[],fields)=>{
                    if(err){
                        return next({message:'Query execution failed',status:500})
                    }
                    if(!result.length){
                        return next({message:'No other users',status:404})
                    }else{
                        resolve(result)
                    }
                })
            })
            res.status(200).json({message:'All users fetched successfully',allUsers})
        } catch (error) {
            console.log(error)
            return next({message:'Something wrong please try again!!'})
        }
    }
    async Me(req: Request|any, res: Response, next: NextFunction): Promise<void> {
        const {id} = req.authUser

        const findUserByIdQuery = `select id,username,email,phone,address,age,isLoggedIn from auth where id = ?`
        
        try {

            const userFound = await new Promise<AuthDTO[]>((resolve,reject)=>{
                db.execute(findUserByIdQuery,[id],(err,result:[],fields)=>{
                    if(err){
                        return next({message:'Query execution failed',status:500})
                    }
                    if(result.length==0){
                        return next({message:'User not found',status:404})
                    }
                    resolve(result)
                })
            })

            res.status(200).json({message:'Me Profile', data:userFound[0]})
        } catch (error) {
            console.log(error)
            return next({message:'Something wrong please try again!!'})
        }
    }
    async SignIn(req: Request, res: Response, next: NextFunction): Promise<void> {
        const data: SignInDTO = req.body
        
        const isUserFoundByEmailQuery = `select * from auth where email = ?`
        const updateLoggedInQuery = `update auth set isLoggedIn = true where id = ?`

        try {
            
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
        } catch (error) {
            console.log(error)
            return next({message:'Something wrong please try again!!'})
        }
    }
    Register(req: Request, res: Response, next: NextFunction): void {
        const data:AuthDTO = req.body

        const checkIsEmailExistQuery = `select * from auth where email = ?`
        const insertQuery = `insert into auth (username,email,password,phone,address,age) values (?,?,?,?,?,?)`

        try {
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
        } catch (error) {
            console.log(error)
            return next({message:'Something wrong please try again!!'})
        }
    }
    DeleteAccount(req: Request|any, res: Response, next: NextFunction): void {
        const {id} = req.authUser

        const deleteQuery = `delete from auth where id = ?`

        try {
            db.execute(deleteQuery,[id],(err,result:ResultSetHeader,fields)=>{
                if(err){
                    return next({message:'Query execution failed',status:500})
                }
                if(result.affectedRows == 0){
                    return next({message:'This account not found yet!!',status:404})
                }else if(result.affectedRows == 1){
                    return res.status(200).json({message:'Your account is deleted..'})
                }
            })
        } catch (error) {
            console.log(error)
            return next({message:'Something wrong please try again!!'})
        }
    }
}

export default AuthController