import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({connectionString : process.env.DATABASE_URL})

export class PrismaService extends PrismaClient {
    constructor(){
        super({adapter: adapter})
    }
}