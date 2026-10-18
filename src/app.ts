import express from "express";
import authRouter from "./modules/auth/auth.routes.js";
import profileRouter from "./modules/profile/profile.routes.js";
import cookiParser from "cookie-parser"
import { errorMiddleware } from "./middleware/error.middleware.js";
import "dotenv/config";
import cors from "cors";
import roleRouter from "./modules/role/role.routes.js";


const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(cookiParser());
app.use(express.json());
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/roles", roleRouter)

app.use(errorMiddleware)

app.listen(3000, () => {
    console.log("server listening on porrt 3000")
})
