import type { Request, Response } from "express";
import { RoleService } from "./role.service.js";

export class RoleController {
    constructor(private roleService:RoleService){}
    getRoles = async (req:Request, res:Response) =>  {
        const roles = await this.roleService.getRoles();
        res.status(200).json({
            message: "Roles fetched successfully",
            roles,
        })
    }
}