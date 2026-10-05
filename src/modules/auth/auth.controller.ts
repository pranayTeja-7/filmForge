import type { AuthService } from "./auth.service.js";
import type { Request, Response } from "express";
export class AuthController {
    constructor(private authService:AuthService){}
    signup = async (req:Request, res:Response) => {
        const {email, password, confirmPassword} = req.body;
        const user = await this.authService.signup(email, password, confirmPassword);
        res.status(201).json({
            message: "user created succesfully",
            user
        })
    }
    
    login = async (req:Request, res:Response) => {
        const {email, password} = req.body;
        const token = await this.authService.login(email, password)
        res.cookie("token", token, {
            httpOnly: true,
            expires: new Date(Date.now() + 15*60*1000)
        })
        res.status(200).json({
            message: "login successful"
        })
    }
}