import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;

    const bot = await prisma.bot.findFirst({
      where: { tenantId },
    });

    if (!bot) {
      return NextResponse.json({ sessions: [] });
    }

    const chatSessions = await prisma.chatSession.findMany({
      where: { botId: bot.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sessions: chatSessions });
  } catch (error: any) {
    console.error("Inbox API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
