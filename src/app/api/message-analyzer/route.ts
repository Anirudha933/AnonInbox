import axios from "axios";
import {analyzer} from "../../../utils/analyzer/route";

export const POST=async(req:Request)=>{
    try{
        const{message}=await req.json();
        // console.log("Message to analyze",message);
        const res=await analyzer({message});
        console.log("Response from analyzer",res);
        if(!res){
            return Response.json({
                success:false,
                message:"Error in checking message authenticity"
            })
        }
        return Response.json({
            success:true,
            message:res
        })
    }
    catch(err){
        console.log("Error in checking message authenticity",err);
        return Response.json({
            success:false,
            message:err || "Error in checking message authenticity"
        })
    }
}