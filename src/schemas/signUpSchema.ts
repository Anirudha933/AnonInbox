import {z} from "zod";

export const userNameValidation=z
                .string()
                .min(4,"Username must be at least 4 characters")
                .max(20,"Username must be at most 20 characters")
                // .regex(/^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/,'Username not in format');

export const signUpSchema=z.object({
    userName:userNameValidation,
    email:z.string().email({message:"Please use a valid email address"}),
    password:z.string().min(8,{message:"Password must be at least 8 characters"}),
})