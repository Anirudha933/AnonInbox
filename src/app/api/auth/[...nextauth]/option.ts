import { connectDB } from "@/lib/dbConnect";
import { UserModel } from "@/models/User";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";


export const authOptions:NextAuthOptions={
    providers:[
        CredentialsProvider({
            // The name to display on the sign in form (e.g. 'Sign in with...')
            // name: 'credentials',
            
            credentials: {
                    identifier: { label: "Email/username", type: "text", placeholder: "example@gmail.com" },
                    password: { label: "Password", type: "password" }
                },
            async authorize(credentials:any):Promise<any> {
                await connectDB();
                try{
                    const user=await UserModel.findOne({
                        $or:[
                            {email:credentials.identifier},
                            {userName:credentials.identifier}
                        ]
                    })
                    if(!user){
                        throw new Error("User not found");
                    }
                    if(!user.isVerified){
                        throw new Error("User is not verified");
                    }
                    const isValidPassword=await bcrypt.compare(credentials.password,user.password);
                    if(!isValidPassword){
                        throw new Error("Invalid password");
                    }
                    return user;
                }
                catch(err:any){
                    console.log(err);
                    throw new Error(err);
                }
            }
        }),
    ],
    callbacks:{
    async jwt({ token, user}) {
          if(user){
              token._id=user._id?.toString();
              token.isVerified=user.isVerified;
              token.isAcceptingMessages=user.isAcceptingMessages;
              token.userName=user.userName;
          }
        return token
      },
    async session({ session, token }) {
        if(token){
            session.user._id=token._id;
            session.user.isVerified=token.isVerified;
            session.user.isAcceptingMessages=token.isAcceptingMessages;
            session.user.userName=token.userName
        }
      return session
    }
    },
    pages:{
        signIn:"/login",
    },
    session:{
        strategy:"jwt",
    },
    secret:process.env.NEXTAUTH_SECRET
}
