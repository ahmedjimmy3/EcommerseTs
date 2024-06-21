import { NextFunction, Request, Response } from "express";

export interface IAuthController{
    Register(req:Request,res:Response,next:NextFunction): void
    SignIn(req:Request,res:Response,next:NextFunction): Promise<void>
    DeleteAccount(req:Request,res:Response,next:NextFunction): void
    Me(req:Request,res:Response,next:NextFunction): Promise<void>
    AllUsers(req:Request,res:Response,next:NextFunction): Promise<void>
}