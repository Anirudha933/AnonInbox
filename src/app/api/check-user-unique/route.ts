import { connectDB } from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import { userNameValidation } from "@/schemas/signUpSchema";
import {z} from "zod";

const UniqueUserQuerySchema=z.object({
    userName:userNameValidation,
})

export async function GET(req: Request) {
    await connectDB();
    try{
        const {searchParams}=new URL(req.url);
        const queryParam={
            userName:searchParams.get("userName")
        }
        //validation of the useranme with zod
        const result=UniqueUserQuerySchema.safeParse(queryParam);
        console.log("Result",result);
        if(!result.success){
           const userNameError= result.error.format().userName?._errors || [];
            return Response.json({success:false,message:userNameError.length>0?userNameError.join(","):"Invalid username"},{status:400});
        }
        const {userName}=result.data;
        const existingUsername=await UserModel.findOne({userName,isVerified:true})
        if(!existingUsername){
            return Response.json({success:true,message:"User name is unique"},{status:200});
        }
        else   return Response.json({success:false,message:"User name is already taken"},{status:400});
    }
    catch(err){
        console.log(err);
        return Response.json({success:false,message:"Error in checking unique username"},{status:500});
    }
}