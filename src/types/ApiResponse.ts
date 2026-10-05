import { Message } from "../models/Message";

export interface apiResponse {
    success: boolean;
    message: string;
    isacceptingMessage?: boolean;
    messages?: Message[];
    nextCursor?: string | null;
    hasMore?: boolean;
}