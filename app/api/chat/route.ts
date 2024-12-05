import { NextResponse } from "next/server";
import { getAIResponse } from "@/app/llm/groq-setup";

export async function POST(req: Request) {
    try {
        const { message, chatId } = await req.json();
        
        if (!chatId) {
            return NextResponse.json({ error: 'chatId is required' }, { status: 400 });
        }

        const response = await getAIResponse(message, chatId);
        
        return NextResponse.json({ response });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}