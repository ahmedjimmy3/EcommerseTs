import { Application, NextFunction,Request,Response } from "express"
import errorHandler from './middlewares/error-handler.middleware'
import express from 'express'
import DataBase from "../db/db-connection"
import AuthRouter from "./modules/Auth/auth.router"

function initiateApp(app:Application):void{
    const db = new DataBase()
    const AuthRoute = new AuthRouter()
    
    db.connectToDB().connect((err)=>{
        if(err){
            console.log('error in db connection',err)
        }else{
            console.log('Connected to database success')
        }
    })
        
    app.use(express.json())

    app.use('/Auth', AuthRoute.router)

    app.use('*',(req:Request,res:Response,next:NextFunction)=>{
        res.status(404).json({message:'This url is not found'})
    })

    app.use(errorHandler)

    app.listen(3030,()=>console.log('E-commerce is listening in port 3030'))
}

export default initiateApp