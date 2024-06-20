export interface AuthDTO {
    id?:number,
    username:string,
    email:string,
    password:string,
    phone:string,
    address:string,
    age:number,
    isEmailVerified?:string,
    isLoggedIn?:string
}

export interface SignInDTO{
    email:string,
    password:string
}
