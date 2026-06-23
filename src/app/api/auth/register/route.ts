import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, companyName } = await req.json();

    if (!email || !password || !companyName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate 3-day trial end date
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 3);

    // Create Tenant and User
    const tenant = await prisma.tenant.create({
      data: {
        name: companyName,
        stripeCurrentPeriodEnd: trialEnd,
        users: {
          create: {
            name,
            email,
            password: hashedPassword,
          },
        },
        bots: {
          create: {
            name: `${companyName} Assistant`,
            systemPrompt: "You are a helpful assistant.",
            welcomeMessage: "Hello! How can I help you today?",
          },
        },
      },
      include: {
        users: true,
      },
    });

    return NextResponse.json(
      { message: "Registration successful", user: tenant.users[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
