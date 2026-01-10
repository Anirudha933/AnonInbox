// here in all the schemas zod is used for taking care of validation
import {boolean, z} from "zod";

export const acceptMessageSchema=z.object({
    acceptMessages:boolean(),
})