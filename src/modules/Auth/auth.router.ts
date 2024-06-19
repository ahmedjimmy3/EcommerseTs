import { Router } from "express";
import AuthController from "./auth.controller";
import { IAuthController } from "./auth.interface";

class AuthRouter {
    router : Router
    private controller :IAuthController

    constructor(){
        this.router = Router()
        this.controller = new AuthController()
        this.initializeRoutes()
    }
    private initializeRoutes(){
        this.router.post('/register',this.controller.Register)
    }
}

export default AuthRouter