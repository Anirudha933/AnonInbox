import { analyzer } from "../../../utils/analyzer/route";
import { checkRateLimit } from "@/lib/ratelimit";

export const POST = async (req: Request) => {
    try {
        const forwardedFor = req.headers.get("x-forwarded-for");
        const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";

        const rateLimit = await checkRateLimit(ip, "analyze-message");
        if (!rateLimit.allowed) {
            return Response.json(
                {
                    success: false,
                    message: "Rate limit exceeded. You can only send up to 5 messages per minute."
                },
                { status: 429 }
            );
        }

        const { message } = await req.json();
        // console.log("Message to analyze",message);
        const res = await analyzer({ message });
        console.log("Response from analyzer", res);
        if (!res) {
            return Response.json({
                success: false,
                message: "Error in checking message authenticity"
            });
        }
        return Response.json({
            success: true,
            message: res
        });
    }
    catch (err) {
        console.log("Error in checking message authenticity", err);
        return Response.json(
            {
                success: false,
                message: err instanceof Error ? err.message : "Error in checking message authenticity"
            },
            { status: 500 }
        );
    }
};