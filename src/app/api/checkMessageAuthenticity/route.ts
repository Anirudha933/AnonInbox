


export const POST=async(req:Request)=>{
    try{
        const{message}=await req.json();
    }
    catch(err){
        console.log("Error in checking message authenticity",err);
        return Response.json({
            success:false,
            message:err || "Error in checking message authenticity"
        })
    }
}