import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";
import { AppError } from "../../errors/app.error.js";
import argon2 from "argon2";
import { TokenService } from "../../infrastructure/auth/token.service.js";

export class AuthService {
    constructor(
        private prisma:PrismaService,
        private tokenService: TokenService
    ) {}

    async signup(email:string, password:string, confirmPassword:string){
        
        if(confirmPassword !== password){
            throw new Error("password and confirmed password do not match")
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

        const user = await this.prisma.user.create({
            data: {
                email: email,
                passwordHash: passwordHash,
            },
            omit: {
                passwordHash: true,
                updatedAt: true
            }
        })

        return user;        
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

        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: refreshTokenHash,
                expiresAt: new Date(Date.now() + 30*24*60*60*1000)
            }
        });
        return {
            accessToken,
            refreshToken,
        }
    }
}