import { z } from "zod"

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
    roleIds: z.array(z.uuid()).min(1).refine((array) => {
        return new Set(array).size === array.length
    },{
        error: "All roleIds must be unique"
    })
})

export type RolesType = z.infer<typeof rolesSchema>