import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from 'jsonwebtoken'
import DataBase from "../../db/db-connection"
import {systemRoles} from '../utils/system-roles'
import { AuthDTO } from "../modules/Auth/auth.dto"

const authMiddleware = async(Role:systemRoles[])=>{
    return async (req:Request|any,res:Response,next:NextFunction)=>{
        try {
            const db = new DataBase().connectToDB()
            const findUserByIdQuery = `select * from auth where id = ?`
            let token = req.headers.authorization
            if(!token){
                return next({message:'Token must be provided',status:400})
            }
            if(!token.startsWith(process.env.PREFIX!)){
                return next({message:'Invalid prefix',status:400})
            }
            token = token.split(process.env.PREFIX!)[1]
            const payload = jwt.verify(token,process.env.SECRET_KEY!) as JwtPayload
            if(!payload || !payload.id){
                return next({message:'Invalid token',status:400})
            }
            const userFound = await new Promise<AuthDTO[]>((resolve,reject)=>{
                db.execute(findUserByIdQuery,[payload.id],(err,result:[],fields)=>{
                    if(err){
                        return next({message:'Query execution failed',status:500})
                    }
                    if(result.length == 0){
                        return next({message:'You must login first',status:400})
                    }
                    resolve(result)
                })
            })
            if(!Role.includes(userFound[0].role!)){
                return next({message:'You are not authorized to access this router',status:401})
            }
            req['authUser'] = payload
            next()
        } catch (error) {
            console.log(error)
            return next({message:'Something wrong please try again .!!'})
        }
    }
}

export default authMiddleware