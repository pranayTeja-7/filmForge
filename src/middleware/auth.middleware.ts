import type { NextFunction, Request, Response } from "express"
import { AppError } from "../errors/app.error.js"
import { TokenService } from "../infrastructure/auth/token.service.js"


const tokenService = new TokenService();

const authMiddleware = (req:Request, res:Response, next:NextFunction) => {
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
        req.user = {id: sub}

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