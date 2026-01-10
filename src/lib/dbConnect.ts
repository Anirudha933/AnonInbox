import mongoose from "mongoose";

// defining the type after db connection
type ConnectionObject={
    isConnected?:number
}

const connection:ConnectionObject={}

export const connectDB=async():Promise<void>=>{
    // next js runs in edge server meaning it doesn't run continuously as it runs in express here it runs only when the page is open so there is a chance that the sderver has established its connection and if u r trying to connect again it might crash .So this is a check if db is already running
    if(connection.isConnected){
        console.log("Already connected to database");
        return;
    }
    try{
        const db=await mongoose.connect(process.env.MONGODB_URL! || " ");
        if(db)
       { 
           connection.isConnected=db.connections[0].readyState
        //    console.log(db.connections);
           console.log("DB connected");
        }
    }
    catch(err){
        console.log("DB connection error",err);
        process.exit(1);
    }
}