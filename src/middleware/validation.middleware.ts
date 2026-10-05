import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export const validationMiddleware = (schema:ZodType):RequestHandler => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if(!result.success){
            res.status(400).json({
                message: result.error.message,
                code: "VALIDATION_ERROR",
                details: result.error.issues
            })
            return;
        }
        else{
            req.body = result.data;
            next();
        }
    }
}


