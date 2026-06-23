import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const bot = await prisma.bot.findFirst({
      where: { tenantId },
    });

    return NextResponse.json({ bot });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const { name, systemPrompt, colorScheme, welcomeMessage, avatarUrl, allowedDomain } = await req.json();

    // Check if bot exists
    const existingBot = await prisma.bot.findFirst({
      where: { tenantId },
    });

    if (existingBot) {
      // Update
      const bot = await prisma.bot.update({
        where: { id: existingBot.id },
        data: { name, systemPrompt, colorScheme, welcomeMessage, avatarUrl, allowedDomain },
      });
      return NextResponse.json({ bot });
    } else {
      // Create
      const bot = await prisma.bot.create({
        data: {
          tenantId,
          name: name || "My Assistant",
          systemPrompt: systemPrompt || "",
          colorScheme: colorScheme || "#000000",
          welcomeMessage: welcomeMessage || "Hi there!",
          avatarUrl,
          allowedDomain
        },
      });
      return NextResponse.json({ bot });
    }
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
