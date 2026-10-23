import { date, z } from "zod"
import { PortfolioItemType } from "../../generated/prisma/enums.js"

export const profileSchema = z.object({
    displayName: z.string().trim().min(3, {
        error: "Display name should be in between 3-100 characters"
    }).max(100, {
        error: "Display name should be in between 3-100 characters"
    }),
    bio: z.string().trim().max(500, {error: "Bio must contain at most 500 characters"}).optional(),
    experience: z.string().trim().max(500, {error: "Experience must contain at most 500 characters"}).optional(),
    location: z.string().trim().max(100, {error: "Location name must contain at most 100 characters"}).optional(),
})

export type ProfileType = z.infer<typeof profileSchema>

export const rolesSchema = z.object({
    roleIds: z.array(z.uuid()).min(1, {error: "Atleast one role is required"}).refine((array) => {
        return new Set(array).size === array.length
    },{
        error: "All roleIds must be unique"
    })
})

export type RolesType = z.infer<typeof rolesSchema>

export const portfolioItemSchema = z.object({
    title: z.string().trim().min(3).max(150),
    type: z.enum(PortfolioItemType),
    customType: z.string().trim().min(3).max(100).optional(),
    description: z.string().max(1000).optional(),
    externalUrl: z.url().max(2048).optional()
}).superRefine((data, context) => {
    if(data.type === "OTHER"){
        if(!data.customType?.trim()){
            context.addIssue({
                code: "custom",
                path: ["customType"],
                message: 'Custom type is required when type is "OTHER"'
            })
        }
    }
    else{
        if(data.customType != undefined){
            context.addIssue({
                code: "custom",
                path: ["customType"],
                message: 'Custom type is allowed only when type is "OTHER"'
            })
        }
    }
})

export type PortfolioItemSchemaType = z.infer<typeof portfolioItemSchema>

export const portfolioItemParamsSchema = z.object({
    id: z.uuid(),
})
