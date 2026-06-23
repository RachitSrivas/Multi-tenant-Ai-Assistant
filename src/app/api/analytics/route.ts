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

    // Total sessions
    const totalSessions = bot
      ? await prisma.chatSession.count({ where: { botId: bot.id } })
      : 0;

    // Total user messages
    const totalMessages = bot
      ? await prisma.chatMessage.count({
          where: { session: { botId: bot.id }, role: "user" },
        })
      : 0;

    // Total documents
    const totalDocuments = await prisma.document.count({
      where: { tenantId },
    });

    // Messages by role
    const messagesByRole = bot
      ? await prisma.chatMessage.groupBy({
          by: ["role"],
          where: { session: { botId: bot.id } },
          _count: { role: true },
        })
      : [];

    const messagesByRoleFormatted = messagesByRole.map(
      (item: { role: string; _count: { role: number } }) => ({
        role: item.role,
        count: item._count.role,
      })
    );

    // Daily messages for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    let dailyMessages: { date: string; count: number }[] = [];

    if (bot) {
      // Get all user messages from last 7 days and group in JS
      const recentMessages = await prisma.chatMessage.findMany({
        where: {
          session: { botId: bot.id },
          role: "user",
          createdAt: { gte: sevenDaysAgo },
        },
        select: { createdAt: true },
      });

      // Build a map of date -> count
      const countMap: Record<string, number> = {};
      for (const msg of recentMessages) {
        const dateKey = msg.createdAt.toISOString().split("T")[0];
        countMap[dateKey] = (countMap[dateKey] || 0) + 1;
      }

      // Fill in all 7 days
      for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        const dateKey = d.toISOString().split("T")[0];
        dailyMessages.push({ date: dateKey, count: countMap[dateKey] || 0 });
      }
    } else {
      for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        dailyMessages.push({
          date: d.toISOString().split("T")[0],
          count: 0,
        });
      }
    }

    // Recent conversations (last 5)
    let recentConversations: {
      id: string;
      createdAt: string;
      messageCount: number;
      preview: string;
    }[] = [];

    if (bot) {
      const sessions = await prisma.chatSession.findMany({
        where: { botId: bot.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          _count: { select: { messages: true } },
          messages: {
            where: { role: "user" },
            orderBy: { createdAt: "asc" },
            take: 1,
            select: { content: true },
          },
        },
      });

      recentConversations = sessions.map((s) => ({
        id: s.id,
        createdAt: s.createdAt.toISOString(),
        messageCount: s._count.messages,
        preview:
          s.messages.length > 0
            ? s.messages[0].content.substring(0, 100)
            : "No messages",
      }));
    }

    // Documents by status
    const documentsByStatusRaw = await prisma.document.groupBy({
      by: ["status"],
      where: { tenantId },
      _count: { status: true },
    });

    const documentsByStatus = documentsByStatusRaw.map(
      (item: { status: string; _count: { status: number } }) => ({
        status: item.status,
        count: item._count.status,
      })
    );

    return NextResponse.json({
      totalSessions,
      totalMessages,
      totalDocuments,
      dailyMessages,
      recentConversations,
      documentsByStatus,
      messagesByRole: messagesByRoleFormatted,
    });
  } catch (error: any) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
