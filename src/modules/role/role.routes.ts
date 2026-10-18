import express from "express";
import { RoleController } from "./role.controller.js";
import { RoleService } from "./role.service.js";
import { prisma } from "../../infrastructure/prisma/prisma.module.js"


const roleRouter = express.Router();

const roleService = new RoleService(prisma);
const roleConstructor = new RoleController(roleService);

roleRouter.get("/", roleConstructor.getRoles);

export default roleRouter;

