import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as cheerio from "cheerio";
import { processAndStoreDocument } from "@/lib/ingestion";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return NextResponse.json({ error: "Valid URL is required" }, { status: 400 });
    }

    const tenantId = (session.user as any).tenantId;

    // 1. Fetch HTML from URL
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch website" }, { status: 400 });
    }
    const html = await response.text();

    // 2. Extract text using cheerio
    const $ = cheerio.load(html);
    
    // Remove scripts, styles, and non-content elements
    $("script, style, noscript, nav, footer, iframe, img, svg").remove();
    
    // Extract text and clean up whitespace
    let extractedText = $("body").text().replace(/\s+/g, " ").trim();

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json({ error: "Could not extract sufficient text from this URL." }, { status: 400 });
    }

    // Use page title as document name
    const title = $("title").text().trim() || url;

    // 3. Save to database
    const document = await prisma.document.create({
      data: {
        name: title,
        type: "URL",
        status: "PROCESSING",
        tenantId,
        url: url,
      },
    });

    // 4. Process and store in Pinecone (running async so we don't block the response)
    processAndStoreDocument(tenantId, document.id, extractedText)
      .then(async () => {
        await prisma.document.update({
          where: { id: document.id },
          data: { status: "PROCESSED" },
        });
      })
      .catch(async (err) => {
        console.error("URL processing failed:", err);
        await prisma.document.update({
          where: { id: document.id },
          data: { status: "FAILED" },
        });
      });

    return NextResponse.json({ success: true, documentId: document.id });
  } catch (error: any) {
    console.error("Scrape API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
