import { NextRequest, NextResponse } from "next/server";
import { streamText, embed } from "ai";
import { mistral } from "@ai-sdk/mistral";
import { getPineconeIndex } from "@/lib/pinecone";
import { prisma } from "@/lib/prisma";

// In-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_MESSAGES = 50;

export async function POST(req: NextRequest) {
  try {
    const { messages, tenantId, sessionId: clientSessionId } = await req.json();

    if (!tenantId) {
      return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
    }

    // 1. Get the latest user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    // 2. Fetch Bot and Tenant configuration
    const bot = await prisma.bot.findFirst({
      where: { tenantId },
      include: {
        tenant: true
      }
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot configuration not found" }, { status: 404 });
    }

    // --- SUBSCRIPTION CHECK ---
    const periodEnd = bot.tenant.stripeCurrentPeriodEnd;
    if (!periodEnd || periodEnd.getTime() < Date.now()) {
      return NextResponse.json({ 
        error: "Subscription expired. Please contact the website owner." 
      }, { status: 403 });
    }
    // --- END SUBSCRIPTION CHECK ---

    // --- SECURITY CHECKS ---
    // A. Domain Whitelisting
    if (bot.allowedDomain) {
      const origin = req.headers.get("origin") || req.headers.get("referer") || "";
      if (origin && !origin.includes(bot.allowedDomain)) {
        return NextResponse.json({ error: "Unauthorized domain" }, { status: 403 });
      }
    }

    // B. IP Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown-ip";
    const now = Date.now();
    const rateLimitInfo = rateLimitMap.get(ip);

    if (rateLimitInfo) {
      if (now > rateLimitInfo.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
      } else {
        if (rateLimitInfo.count >= RATE_LIMIT_MAX_MESSAGES) {
          return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
        }
        rateLimitInfo.count += 1;
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    }
    // --- END SECURITY CHECKS ---

    // 3. Generate embedding for the query using Mistral
    const { embedding: queryEmbedding } = await embed({
      model: mistral.embedding("mistral-embed"),
      value: lastMessage.content,
    });

    // 4. Query Pinecone for context
    const index = getPineconeIndex();
    const queryResult = await index.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
      filter: {
        tenantId: { $eq: tenantId },
      },
    });

    // 5. Extract context strings
    const contexts = queryResult.matches
      .map((match) => match.metadata?.text)
      .filter(Boolean) as string[];

    const contextText = contexts.join("\n\n");

    // 6. Build the System Prompt
    const systemPrompt = `
You are a helpful AI assistant named ${bot.name}.
${bot.systemPrompt || "Answer the user's questions based on the provided context."}

Here is the context information retrieved from the company's knowledge base:
<context>
${contextText}
</context>

If the answer is not contained within the context, politely inform the user that you don't have that information.
    `.trim();

    // 7. Log the chat interaction
    let session;
    
    if (clientSessionId) {
      session = await prisma.chatSession.findUnique({
        where: { id: clientSessionId }
      });
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: { 
          id: clientSessionId || undefined,
          botId: bot.id 
        },
      });
    }

    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "user",
        content: lastMessage.content,
      },
    });

    // 8. Filter messages to only valid roles for the AI SDK
    const validMessages = messages.filter(
      (m: any) => m.role === "user" || m.role === "assistant"
    );

    // 9. Stream the response using Vercel AI SDK and Mistral
    const result = streamText({
      model: mistral("mistral-small-latest"),
      system: systemPrompt,
      messages: validMessages,
      async onFinish({ text }) {
        try {
          await prisma.chatMessage.create({
            data: {
              sessionId: session.id,
              role: "assistant",
              content: text,
            },
          });
        } catch (e) {
          console.error("Failed to log assistant message", e);
        }
      },
    });

    return result.toTextStreamResponse({
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow cross-origin for the chat widget
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
