import express from "express";
import authRouter from "./modules/auth/auth.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import "dotenv/config";


const app = express();

app.use(express.json());
app.use("/auth", authRouter);

app.use(errorMiddleware)

app.listen(3000, () => {
    console.log("server listening on porrt 3000")
})
