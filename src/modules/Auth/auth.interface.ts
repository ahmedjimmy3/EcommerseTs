import { NextFunction, Request, Response } from "express";

export interface IAuthController{
    Register(req:Request,res:Response,next:NextFunction): void
    SignIn(req:Request,res:Response,next:NextFunction): Promise<void>
}