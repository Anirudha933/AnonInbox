import { google } from '@ai-sdk/google'
import { streamText, createUIMessageStreamResponse } from 'ai'
import { NextRequest } from 'next/server'
export const runtime = 'edge'
export async function POST(req: NextRequest) {
  try {
    const prompt = `
Create a list of three short, constructive feedback messages formatted as a single string.
Each message should be separated by '||'. These messages are for an anonymous feedback platform
and should be applicable to most products or services (apps, websites, tools, or platforms).

The feedback should be balanced — a mix of mildly positive and mildly negative observations —
and written in a respectful, non-aggressive tone. Avoid personal attacks, sensitive topics,
or highly specific product details. Focus on universal aspects such as usability, performance,
design, clarity, or overall experience.

Example output format:
The overall experience is good, but navigation could be more intuitive.||I like the concept, though some features feel slightly unfinished.||The product works well, but response times could be improved.

Ensure the feedback feels honest, thoughtful, and suitable for a diverse audience while encouraging improvement rather than criticism.
`;



    // Start streaming from Gemini
    const result = streamText({
      model: google('gemini-2.5-flash'),
      prompt,
    })
    console.log('Generating messages...', result.toTextStreamResponse())
    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error('Error in generating messages', err)
    return new Response(JSON.stringify({ error: 'Error generating messages' }), { status: 500 })
  }
}
