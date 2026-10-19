import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL})

const prisma = new PrismaClient({adapter: adapter});

const roles = [
    "Director",
    "Cinematographer",
    "Editor",
    "Music Director",
    "Actor",
    "Producer",
    "Composer",
    "Sound Designer",
    "Writer"
]

const main = async () => {
    for(const role of roles){
        await prisma.role.upsert({
            where: {name : role},
            update: {},
            create: {name : role}
        })
    }
}

try {
    await main();
} catch (error) {
    console.log(error);
    process.exitCode = 1
} finally {
    await prisma.$disconnect();
}