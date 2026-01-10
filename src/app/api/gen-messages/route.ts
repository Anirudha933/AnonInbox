import { google } from '@ai-sdk/google'
import { streamText, createUIMessageStreamResponse } from 'ai'
import { NextRequest } from 'next/server'
export const runtime = 'edge'
export async function POST(req: NextRequest) {
  try {
    const prompt = `
    Create a list of three open-ended and engaging questions formatted as a single string.
    Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me,
    and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that
    encourage friendly interaction. For example, your output should be structured like this:
    "What's a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?".
    Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.
    `


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
