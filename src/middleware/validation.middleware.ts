import type { RequestHandler } from "express";
import type { ZodType } from "zod";

type validationMiddlewareDatatype = "body" | "params"

export const validationMiddleware = (schema:ZodType, type:validationMiddlewareDatatype):RequestHandler => {
    return (req, res, next) => {
        if(type === "body"){
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
        else if(type === "params"){
            const result = schema.safeParse(req.params);
            if(!result.success){
                res.status(400).json({
                    message: result.error.message,
                    code: "VALIDATION_ERROR",
                    details: result.error.issues
                })
                return;
            }
            else{
                next()
            }
        }
        
    }
}


