import { AppError } from "../errors/app.error.js";
import type { ErrorRequestHandler } from "express";

export const errorMiddleware:ErrorRequestHandler = (err, req, res, next) => {
    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            message: err.message,
            code: err.code,
        })
    }

    console.log(err)
    res.status(500).json({
        message: "Something went wrong",
        code: "INTERNAL_SERVER_ERROR"
    })
}

