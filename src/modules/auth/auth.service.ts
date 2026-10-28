import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";
import { AppError } from "../../errors/app.error.js";
import argon2 from "argon2";
import { TokenService } from "../../infrastructure/auth/token.service.js";
import { Prisma } from "../../generated/prisma/client.js";

export class AuthService {
    constructor(
        private prisma:PrismaService,
        private tokenService: TokenService
    ) {}

    async signup(email:string, password:string, confirmPassword:string){
        
        if(confirmPassword !== password){
            throw new AppError(
                400,
                "PASSWORDS_DO_NOT_MATCH",
                "password and confirmed password do not match"
            )
        }

        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if(existingUser){
            throw new AppError(
                409,
                "EMAIL_ALREADY_EXISTS",
                "An account with this email already exists"
            );
        }

        const passwordHash = await argon2.hash(password);
        const refreshToken = this.tokenService.generateRefreshToken();
        const refreshTokenHash = await argon2.hash(refreshToken);



        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        email: email,
                        passwordHash: passwordHash,
                    },
                    omit: {
                        passwordHash: true,
                        updatedAt: true
                    }
                }) 

                const accessToken = this.tokenService.generateAccessToken(user.id);


                const refreshTokenData = await tx.refreshToken.create({
                    data: {
                        userId: user.id,
                        tokenHash : refreshTokenHash,
                        expiresAt: new Date(Date.now() + 30*24*60*60*1000)
                    }
                })

                return {user, refreshTokenData, accessToken};
                
            })

            const {user, refreshTokenData, accessToken} = result

            const refreshTokenCookie = `${refreshTokenData.id}.${refreshToken}`
            return {
                user,
                refreshTokenCookie,
                accessToken
            }
        } catch (error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"){
                throw new AppError(
                    409,
                    "EMAIL_ALREADY_EXISTS",
                    "An account with this email already exists"
                );
            }
            
            throw error;
        }
        
             
    }

    
    async login(email:string, password:string){
        const user = await this.prisma.user.findUnique({
            where: {
                email
            }
        })

        if(!user){
            throw new AppError(
                401,
                "INVALID_CREDENTIALS",
                "Invalid credentials"
            )
        };

        const match = await argon2.verify(user.passwordHash, password);

        if(!match){
            throw new AppError(
                401,
                "INVALID_CREDENTIALS",
                "Invalid credentials"
            )
        };

        const accessToken = this.tokenService.generateAccessToken(user.id);
        const refreshToken = this.tokenService.generateRefreshToken();
        
        const refreshTokenHash = await argon2.hash(refreshToken);

        const refreshTokenData = await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: refreshTokenHash,
                expiresAt: new Date(Date.now() + 30*24*60*60*1000)
            }
        });

        const refreshTokenCookie = `${refreshTokenData.id}.${refreshToken}`
        return {
            accessToken,
            refreshTokenCookie,
        }
    }


    async me(user:{id:string, email:string}){
        
        const profileData = await this.prisma.profile.findUnique({
            where: {
                userId: user.id
            },
            select: {
                onboardingStatus: true,
            }
        })

        const data = {
            ...user,
            profile: profileData
        }

        return data;
    }
    
    async refreshToken(refreshTokenCookie:string) {
        const refreshTokenParts = refreshTokenCookie.split(".");
        if(refreshTokenParts.length !== 2){
            throw new AppError(
                401,
                "INVALID TOKEN",
                "Invalid refresh token. Please login"
            )
        }
        
        const [tokenId, refreshToken] = refreshTokenParts
        
        if(!(tokenId && refreshToken)){
            throw new AppError(
                401,
                "INVALID TOKEN",
                "Invalid refresh token. Please login"
            )
        }

        const refreshTokenData = await this.prisma.refreshToken.findUnique({
            where: {
                id: tokenId
            }
        });

        if(!refreshTokenData){
            throw new AppError(
                401,
                "INVALID TOKEN",
                "Invalid refresh token. Please login"
            )
        }

        if(refreshTokenData.revokedAt !== null){
            throw new AppError(
                401,
                "TOKEN REVOKED",
                "This token has been revoked. Please use the current one"
            )
        }

        if(refreshTokenData.expiresAt <= new Date(Date.now())){
            throw new AppError(
                401,
                "TOKEN EXPIRED",
                "Token expired. Please login"
            )
        }

        const match = await argon2.verify(refreshTokenData.tokenHash, refreshToken)

        if(!match){
            throw new AppError(
                401,
                "INVALID TOKEN",
                "Invalid refresh token. Please login"
            )
        }

        const result = await this.prisma.$transaction(async (tx) => {
            const revokedRefreshToken = await tx.refreshToken.updateMany({
                data: {
                    revokedAt: new Date(Date.now())
                },
                where: {
                    id: tokenId,
                    revokedAt: null
                }
            })

            if(revokedRefreshToken.count === 0){
                throw new AppError(
                    401,
                    "TOKEN REVOKED",
                    "Refresh Token has aldready been revoked or used"
                )
            }


            const newRefreshToken = this.tokenService.generateRefreshToken();
            const newRefreshTokenHash = await argon2.hash(newRefreshToken);
            const newRefreshTokenData = await tx.refreshToken.create({
                data: {
                    userId: refreshTokenData.userId,
                    tokenHash: newRefreshTokenHash,
                    expiresAt: new Date(Date.now() + 30*24*60*60*1000)
                }
            })

            const newRefreshTokenCookie = `${newRefreshTokenData.id}.${newRefreshToken}`

            return newRefreshTokenCookie;
        })


        const accessToken = this.tokenService.generateAccessToken(refreshTokenData.userId);

        return {
            accessToken: accessToken,
            refreshToken: result
        }
    } 

    async logout(refreshTokenCookie:string){

        if(!refreshTokenCookie){
            return
        }

        const refreshTokenParts = refreshTokenCookie.split(".");
        if(refreshTokenParts.length !== 2){
            return;
        }
        
        const [tokenId, refreshToken] = refreshTokenParts
        
        if(!(tokenId && refreshToken)){
            return;
        }

        const refreshTokenData = await this.prisma.refreshToken.findUnique({
            where: {
                id: tokenId
            }
        })

        if(!refreshTokenData){
            return;
        }

        if(refreshTokenData.revokedAt !== null){
            return
        }

        const match = await argon2.verify(refreshTokenData.tokenHash, refreshToken);

        if(!match){
            return
        }

        await this.prisma.refreshToken.updateMany({
            data: {
                revokedAt: new Date(Date.now())
            },
            where: {
                id: tokenId,
                revokedAt: null
            }
        })

        return
    }
}