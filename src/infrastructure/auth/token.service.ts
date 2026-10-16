import  Jwt  from "jsonwebtoken"
import crypto from "node:crypto"
import { AppError } from "../../errors/app.error.js";

export class TokenService {
    generateAccessToken(userId:string){
        return Jwt.sign(
            {
                sub: userId,
                type: "access"
            },
            process.env.JWT_ACCESS_SECRET!,
            {
                expiresIn: "15m"
            }
        )
    }

    verifyAccessToken(token: string){
        try {
           return Jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
        } catch (error) {
            console.log(error);
            throw new AppError(
                401,
                "INVALID_TOKEN",
                "Invalid Token, please login"
            )
        }
    }

    generateRefreshToken(){
        return crypto.randomBytes(64).toString("hex");
    }
}