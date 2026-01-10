import {z} from "zod";

export const loginSchema=z.object({
    identifier: z.string().min(3, "Email or username is required"),
    password:z.string().min(8,{message:"Password must be at least 8 characters"}),
})