import { NextResponse } from "next/server";
import OpenAI from "openai";

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

interface ChatBody {
  prompt?: string;
  instruction?: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  userApiKey?: string;
}

async function callHuggingFace(
  instruction: string,
  prompt: string,
  max_tokens: number,
  temperature: number
): Promise<string> {
  const hfKey = process.env.HUGGINGFACE_API_KEY;
  if (!hfKey) throw new Error("No AI provider configured. Add a HUGGINGFACE_API_KEY or use your own OpenAI key in Settings.");

  const res = await fetch(
    "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        messages: [
          { role: "system", content: instruction },
          { role: "user", content: prompt },
        ],
        max_tokens: Math.min(max_tokens, 1500),
        temperature,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message || `HuggingFace error ${res.status}`);
  }

  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function callOpenAI(
  apiKey: string,
  instruction: string,
  prompt: string,
  model: string,
  max_tokens: number,
  temperature: number
): Promise<string> {
  const openai = new OpenAI({ apiKey });
  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: instruction },
      { role: "user", content: prompt },
    ],
    max_tokens: Math.min(max_tokens, 2000),
    temperature,
  });
  return completion.choices[0]?.message?.content?.trim() || "";
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Expected application/json body" }, {
        status: 400,
        headers: noCacheHeaders,
      });
    }

    const body = (await req.json()) as ChatBody;
    const {
      prompt = "",
      instruction = "Refine and clean up this text into a high-quality reusable AI prompt. Return just the improved prompt.",
      model = "gpt-4o-mini",
      max_tokens = 500,
      temperature = 0.7,
      userApiKey = "",
    } = body;

    if (!prompt.trim()) {
      return NextResponse.json({ error: "Empty 'prompt' field" }, {
        status: 400,
        headers: noCacheHeaders,
      });
    }

    let answer: string;
    let providerModel: string;

    if (userApiKey.trim()) {
      // User provided their own OpenAI key
      answer = await callOpenAI(userApiKey.trim(), instruction, prompt, model, max_tokens, temperature);
      providerModel = model;
    } else {
      // Fall back to HuggingFace (free, server-side key)
      answer = await callHuggingFace(instruction, prompt, max_tokens, temperature);
      providerModel = "mistral-7b-instruct";
    }

    return NextResponse.json({ model: providerModel, answer }, {
      headers: noCacheHeaders,
    });
  } catch (err) {
    console.error("/api/chat error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, {
      status: 500,
      headers: noCacheHeaders,
    });
  }
}
