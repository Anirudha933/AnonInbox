import {z} from "zod";


export const AiResponseSchema=z.union([
  z.object({state:z.literal("ALLOWED")}),
  z.object({state:z.literal("BLOCKED")}),
  z.object({
    state:z.literal("WARNING"),
    improved_message:z.string()
  })
])