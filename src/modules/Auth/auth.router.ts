import { Router } from "express";
import AuthController from "./auth.controller";
import { IAuthController } from "./auth.interface";
import authMiddleware from "../../middlewares/auth.middleware";
import { authRoles } from "./auth.roles";

class AuthRouter {
    router : Router
    private controller :IAuthController

    constructor(){
        this.router = Router()
        this.controller = new AuthController()
        this.initializeRoutes()
    }
    private async initializeRoutes(){
        this.router.post('/register',this.controller.Register)
        this.router.post('/login',this.controller.SignIn)
        this.router.delete('/delete-account',
            await authMiddleware(authRoles.GENERAL_USAGE),
            this.controller.DeleteAccount
        )
        this.router.get('/me',
            await authMiddleware(authRoles.GENERAL_USAGE),
            this.controller.Me
        )
        this.router.get('/users',
            await authMiddleware(authRoles.GENERAL_USAGE),
            this.controller.AllUsers
        )
    }
}

export default AuthRouter