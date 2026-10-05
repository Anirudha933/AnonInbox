import { redis } from "@/lib/redis";

export async function GET(req: Request) {

    const { searchParams } = new URL(req.url);

    const jobId = searchParams.get("jobId");

    if (!jobId) {
        return Response.json(
            {
                success: false,
                message: "Job ID is required"
            },
            { status: 400 }
        );
    }

    const result = await redis.get(
        `message-status:${jobId}`
    );

    if (!result) {
        return Response.json({
            success: true,
            status: "processing"
        });
    }

    return Response.json({
        success: true,
        ...JSON.parse(result)
    });
}