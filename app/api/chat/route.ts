import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { messages, model = "deepseek/deepseek-r1-0528-qwen3-8b:free", stream = false } = await request.json()

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.VERCEL_URL || "http://localhost:3000",
        "X-Title": "Advanced Chatbot App",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: stream,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.9,
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    if (stream) {
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error calling OpenRouter API:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}
