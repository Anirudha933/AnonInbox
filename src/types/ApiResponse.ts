import { Message } from "@/models/User";
export interface apiResponse {
        success: boolean;
        message: string;
        isacceptingMessage?: boolean;
        messages?: [Message];
    }