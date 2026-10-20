import { AppError } from "../../errors/app.error.js";
import type { AuthService } from "./auth.service.js";
import type { Request, Response } from "express";
export class AuthController {
    constructor(private authService:AuthService){}
    signup = async (req:Request, res:Response) => {
        const {email, password, confirmPassword} = req.body;
        const {user, refreshTokenCookie, accessToken} = await this.authService.signup(email, password, confirmPassword);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            expires: new Date(Date.now() + 15*60*1000)
        })

        res.cookie("refreshToken", refreshTokenCookie, {
            httpOnly: true,
            expires: new Date(Date.now() + 30*24*60*1000,)
        })

        res.status(201).json({
            message: "user created succesfully",
            user,
        })
    }
    
    login = async (req:Request, res:Response) => {
        const {email, password} = req.body;
        const {accessToken, refreshTokenCookie} = await this.authService.login(email, password)
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            expires: new Date(Date.now() + 15*60*1000)
        })

        res.cookie("refreshToken", refreshTokenCookie, {
            httpOnly: true,
            expires: new Date(Date.now() + 30*24*60*60*1000),
        })
        res.status(200).json({
            message: "login successful"
        })
    }

    me = async (req:Request, res:Response) => {
        const userId = req.user?.id;

        if(!userId){
            throw new AppError(
                401,
                "UNAUTHENTICATED",
                "Authentication required. Please login"
            )
        }

        const userData = await this.authService.me(userId);

        res.status(200).json({
            message: "userId fetched successfully",
            userData
        })
    }

    refreshToken = async (req:Request, res:Response) => {
        if(!req.cookies){
            throw new AppError(
                401,
                "TOKEN NOT FOUND",
                "Token not found. Please login"
            )
        }

        const oldRefreshTokenCookie = req.cookies.refreshToken;


        if(!oldRefreshTokenCookie){
            throw new AppError(
                401,
                "TOKEN NOT FOUND",
                "Token not found. Please login"
            )
        }

        const {accessToken, refreshToken} = await this.authService.refreshToken(oldRefreshTokenCookie);

        
        
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            expires: new Date(Date.now() + 15*60*1000)
        })
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            expires: new Date(Date.now() + 30*24*60*60*1000)
        })
        res.status(200).json({
            message: "Token refreshed succesfully"
        })
    }

    logout = async (req:Request, res:Response) => {
        const {accessToken, refreshToken} = req.cookies;
        await this.authService.logout(refreshToken);

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.status(200).json({
            message: "Logout succesfull"
        })
    }
}