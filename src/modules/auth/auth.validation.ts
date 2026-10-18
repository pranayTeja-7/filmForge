import { z } from "zod";

export const signupSchema = z.object({
    email: z.email().trim().toLowerCase(),
    password: z.string()
        .min(8, {error: "Password must contain atleast 8 characters"})
        .regex(/[A-Z]/, "Password must contain atleast one uppercase letter")
        .regex(/[a-z]/, "Password must contain atleast one lowercase letter")
        .regex(/[0-9]/, "Password must contain atleast one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain atleast one special character"),
    confirmPassword: z.string()
})


export const loginSchema = z.object({
    email: z.email().trim().toLowerCase(),
    password: z.string()
})