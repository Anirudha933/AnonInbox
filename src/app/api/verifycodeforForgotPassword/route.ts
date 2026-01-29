import { connectDB } from "@/lib/dbConnect";
import { UserModel } from "@/models/User";


export const POST = async (req: Request) => {
    await connectDB();
    try {
        const { email, code } = await req.json();
        console.log(email, code);
        const user = await UserModel.findOne({ email });
        if (!user) {
            return Response.json({ success: false, message: "User with these email address doesnt exist" });
        }
        if (!user.forgotPasswordCodeExpiry) {
            return Response.json({ success: false, message: "Verification Code not found" });
        }
        if (new Date(user?.forgotPasswordCodeExpiry) < new Date(Date.now())) {
            return Response.json({ success: false, message: "Code expired" });
        }
        if (user.forgotPasswordCode !== code) {
            return Response.json({ success: false, message: "Invalid code" });
        }
        return Response.json({ success: true, message: "Code verified successfully" });
    }
    catch (err) {
        console.log(err);
        return { success: false, message: "Error in verifying code" };
    }
}