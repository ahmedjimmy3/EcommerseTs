import { NextFunction, Request, Response } from "express";
import {IAuthController} from './auth.interface'

class AuthController implements IAuthController {
    Register(req: Request, res: Response, next: NextFunction): void {
    }
}

export default AuthController