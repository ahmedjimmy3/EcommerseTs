import { NextFunction,Request,Response } from "express"

export interface httpError extends Error{
    status?:number
    message:string
}

const errorHandler = (error:httpError,req:Request,res:Response,next:NextFunction)=>{
    console.log(error)
    res.status(error.status || 500).json({message: error.message})
}
export default errorHandler