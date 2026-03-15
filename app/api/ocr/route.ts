import { NextResponse } from "next/server";
import OpenAI from "openai";

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart/form-data with a file field named 'file'" },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const form = await request.formData();
    const file = form.get("file");
    const mode = (form.get("mode") || "printed").toString();
    const userApiKey = (form.get("userApiKey") || "").toString().trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing image file" }, {
        status: 400,
        headers: noCacheHeaders,
      });
    }

    const openaiKey = userApiKey || process.env.OPENAI_API_KEY || "";
    if (!openaiKey) {
      return NextResponse.json(
        { error: "OCR requires an OpenAI API key. Add yours in Settings." },
        { status: 503, headers: noCacheHeaders }
      );
    }

    const arrayBuf = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuf).toString("base64");
    const mimeType = file.type || "image/png";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const openai = new OpenAI({ apiKey: openaiKey });

    const modeInstruction = mode === "handwritten"
      ? "This image contains handwritten text. Please extract and transcribe all handwritten text as accurately as possible."
      : "This image contains printed text. Please extract and transcribe all text as accurately as possible.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an OCR assistant. Extract all text from the provided image. Return only the extracted text, nothing else. Preserve the original formatting and structure as much as possible.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: modeInstruction },
            { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
          ],
        },
      ],
      max_tokens: 2000,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";
    if (!text) {
      return NextResponse.json(
        { error: "No text could be extracted from the image." },
        { status: 422, headers: noCacheHeaders }
      );
    }

    return NextResponse.json({ text, model: "gpt-4o-mini" }, { headers: noCacheHeaders });
  } catch (err) {
    console.error("/api/ocr error:", err);
    const isQuota = err instanceof Error &&
      (err.message.includes("quota") || err.message.includes("429"));
    if (isQuota) {
      return NextResponse.json(
        { error: "OpenAI quota exceeded. Check billing at platform.openai.com, or add your own key in Settings." },
        { status: 429, headers: noCacheHeaders }
      );
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, {
      status: 500,
      headers: noCacheHeaders,
    });
  }
}
