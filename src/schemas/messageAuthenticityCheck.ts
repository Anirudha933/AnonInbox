import {z} from "zod";

const PROFANITY_REGEX =/\b(fuck|shit|asshole|bitch)(?:s|ing|ed)?\b/i;
const INSULT_REGEX =/\b(stupid|idiot|dumb|moron|useless)(?:ly|ness)?\b/i;
const SEXUAL_REGEX =/\b(sex|nude|naked|porn)(?:y|ing)?\b/i;
const VIOLENCE_REGEX =/\b(kill|hurt|beat|attack)(?:s|ed|ing)?\b/i;

export type warningTypes = 'profanity' | 'insult' | 'sexual' | 'violence';

export const messageAuthenticityCheckSchema=z.object({
    message:z.string().min(1,"Message cannot be empty").superRefine((data,ctx)=>{
        const text=data.toLowerCase();
        if(PROFANITY_REGEX.test(text)){
            ctx.addIssue({
                code:z.ZodIssueCode.custom,
                message:"profanity",
            });
        }
        if(INSULT_REGEX.test(text)){
            ctx.addIssue({
                code:z.ZodIssueCode.custom,
                message:"insult",
            });
        }
        if(SEXUAL_REGEX.test(text)){
            ctx.addIssue({
                code:z.ZodIssueCode.custom,
                message:"sexual",
            });
        }
        if(VIOLENCE_REGEX.test(text)){
            ctx.addIssue({
                code:z.ZodIssueCode.custom,
                message:"violence",
            });
        }

    })
})