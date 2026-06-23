import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractTextFromPDF, processAndStoreDocument } from "@/lib/ingestion";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: "User does not belong to a tenant" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read the file into a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Create a pending document record in DB
    const document = await prisma.document.create({
      data: {
        name: file.name,
        type: file.type.includes("pdf") ? "PDF" : "TEXT",
        status: "PROCESSING",
        tenantId,
      },
    });

    // 2. Extract Text
    let text = "";
    if (file.type === "application/pdf") {
      text = await extractTextFromPDF(buffer);
    } else {
      text = buffer.toString("utf-8"); // Assume text file fallback
    }

    // 3. Process & Store in Pinecone
    await processAndStoreDocument(tenantId, document.id, text);

    // 4. Update document status to PROCESSED
    await prisma.document.update({
      where: { id: document.id },
      data: { status: "PROCESSED" },
    });

    return NextResponse.json({ success: true, document });

  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
