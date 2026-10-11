import express from "express";
import authRouter from "./modules/auth/auth.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import "dotenv/config";
import cors from "cors";


const app = express();

app.use(cors({
    origin: "http://localhost:5173"
}))

app.use(express.json());
app.use("/auth", authRouter);

app.use(errorMiddleware)

app.listen(3000, () => {
    console.log("server listening on porrt 3000")
})
