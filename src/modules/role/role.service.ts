import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";

export class RoleService {
    constructor(private prisma:PrismaService){}

    async getRoles(){
        const roles = await this.prisma.role.findMany({
            select: {
                id: true,
                name: true
            },
            orderBy: {
                name: "asc"
            }
        })

        return roles;
    }
}

