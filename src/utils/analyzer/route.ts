// import { google } from '@ai-sdk/google'

import { groq } from '@ai-sdk/groq';
import * as ai from 'ai'
import {AiResponseSchema} from "@/schemas/aimessageverificationSchema";

type msg={
    message:string
}

const extractJSON=(text:string)=>{
    const jsonFormat=text
                      .replace(/```json/g, "")
                      .replace(/```/g, "")
                      .trim();
    return JSON.parse(jsonFormat);
}

export const analyzer=async({message}:msg)=>{
   try{
    // console.log("Message received for analysis",message);
    //  const {message}=await req.json();
    if(message){
    const prompt=`
You are an AI content moderation and analysis system for an anonymous feedback platform.

Your task is to analyze the given message and classify it into exactly ONE of the following categories:
- ALLOWED
- WARNING
- BLOCKED

You must understand the **context, intent, and target** of the message.  
Your goal is to clearly distinguish **honest or negative feedback** from **harassment, abuse, threats, or illegal content**.

━━━━━━━━━━━━━━━━━━
CLASSIFICATION RULES
━━━━━━━━━━━━━━━━━━

🟢 ALLOWED  
Choose ALLOWED if ALL of the following are true:
- The message contains no threats of violence.
- The message does not target protected groups (religion, caste, race, gender, nationality, sexual orientation).
- The message does not contain illegal content.
- The message does not include explicit harassment.

Negative opinions, frustration, disappointment, or criticism are allowed **as long as they focus on the product, service, behavior, or outcome**, not on attacking a person’s identity or safety.

Examples of ALLOWED messages:
- “Your product is bad and disappointing.”
- “I’m unhappy with how this was handled.”
- “This service wastes time.”
- “I expected better performance.”

Rule:
If criticism is about **work, behavior, quality, or outcome**, classify as ALLOWED.

━━━━━━━━━━━━━━━━━━

🟡 WARNING  
Choose WARNING if the message is NOT dangerous but shows disrespectful or aggressive tone.

Criteria:
- Aggressive or rude language
- Mild profanity
- Personal attacks that do NOT include threats or hate
- Insults that are non-violent and non-hateful

The message may feel hostile but does not create fear, target protected groups, or encourage harm.

Examples of WARNING messages:
- “This is stupid.”
- “You clearly don’t know what you’re doing.”
- “What the hell is this?”
- “This is crap.”

Rule:
If the message attacks competence or expresses frustration **without threatening harm or targeting protected identities**, classify as WARNING.

━━━━━━━━━━━━━━━━━━

🔴 BLOCKED  
Choose BLOCKED if ANY ONE of the following is present:

A. Violence or Threats  
- Threats of harm, intimidation, stalking, or physical violence  
Examples:
- “I will hurt you.”
- “You should be beaten.”
- “I’ll find you.”

B. Hate Speech (Protected Groups)  
Any attack or demeaning language targeting:
- Religion
- Caste
- Race
- Gender
- Sexual orientation
- Nationality

Examples:
- “People like you should not exist.”
- “You’re trash because of your religion.”

C. Illegal Content  
- Sexual content involving minors
- Explicit criminal activity
- Terrorism encouragement
- Blackmail or extortion

D. Severe Harassment  
- Repeated degradation
- Dehumanizing language
- Sexual harassment

Rule:
If the message creates fear, promotes harm, targets identity, or involves illegal activity, classify as BLOCKED.

━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (STRICT)
━━━━━━━━━━━━━━━━━━

Analyze the message and return ONLY raw JSON.
Do NOT include markdown, code fences, or explanations.
Do NOT use triple backticks.

Valid outputs:

1. Allowed:
{ "state": "ALLOWED" }

2. Warning:
{
  "state": "WARNING",
  "improved_message": "rewritten respectful version of the message"
}

3. Blocked:
{ "state": "BLOCKED" } 

━━━━━━━━━━━━━━━━━━
MESSAGE TO ANALYZE:
{${message}}
    `;
        

    const result = await ai.generateText({
        model: groq('qwen/qwen3.8-27b'), 
        maxOutputTokens: 50,
        temperature: 0,
        prompt,
        });
        if(!result.text){
          return "Error occured while analysysing message"
        }
        
        const parsed=AiResponseSchema.parse(
          extractJSON(result.text)
        );
        return parsed;
        // console.log("Response from Ai analyzer",parsed.state);
       
        // const result = await ai.generateText({
        //     model: google('gemini-2.5-flash'),
        //     prompt,
        //     maxOutputTokens: 50,
        // });
}   
   }
   catch(err){
        console.log("Error in generating response",err);
        return Response.json({
            success : false,
            message : err || "Error in generating response"
        },{status:500})
   }
}

