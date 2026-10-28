import type { NextFunction, Request, Response } from "express"
import { AppError } from "../errors/app.error.js"
import { TokenService } from "../infrastructure/auth/token.service.js"
import {prisma} from "../infrastructure/prisma/prisma.module.js"

const tokenService = new TokenService();

const authMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    const {accessToken} = req.cookies

    if(!accessToken){
        throw new AppError(
            401,
            "TOKEN_NOT_FOUND",
            "Access token not found. please login"
        )
    }

    const payload = tokenService.verifyAccessToken(accessToken);
    
    if(typeof payload === "object" && payload){
        const {sub, type} = payload;
        if(type !== "access"){
            throw new AppError(
                401,
                "INVALID_TOKEN_TYPE",
                "Invalid token type. Please use an access token"
            )
        }
        if(typeof sub !== "string"){
            throw new AppError(
                401,
                "INVALID_TOKEN",
                "Invalid access token"
            )
        }

        const user = await prisma.user.findUnique({
            where: {
                id: sub,
            },
            select: {
                id: true,
                email: true,
            }
        })

        if(!user){
            throw new AppError(
                401,
                "USER_NOT_FOUND",
                "User account no longer exists"
            )
        }
        req.user = user

        next();
    }
    else{
        throw new AppError(
            401,
            "INVALID_TOKEN",
            "Invalid access token"
        )
    }

}

export default authMiddleware