import  Jwt  from "jsonwebtoken"


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
        return Jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    }
}