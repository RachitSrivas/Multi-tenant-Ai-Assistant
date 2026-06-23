import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const tenantId = (session.user as any).tenantId;

  const bot = await prisma.bot.findFirst({
    where: { tenantId },
  });

  const docsCount = await prisma.document.count({
    where: { tenantId },
  });

  return (
    <div>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Welcome, {session.user.name}</h1>
      <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
        Here is the overview of your chatbot factory.
      </p>

      <div style={{ display: "flex", gap: "1.5rem" }}>
        <div style={{
          backgroundColor: "var(--surface)",
          padding: "1.5rem",
          borderRadius: "8px",
          border: "1px solid var(--surface-border)",
          flex: 1
        }}>
          <h3 style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Bot Name</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: 600, marginTop: "0.5rem" }}>{bot?.name || "Not configured"}</p>
        </div>

        <div style={{
          backgroundColor: "var(--surface)",
          padding: "1.5rem",
          borderRadius: "8px",
          border: "1px solid var(--surface-border)",
          flex: 1
        }}>
          <h3 style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Total Knowledge Documents</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: 600, marginTop: "0.5rem" }}>{docsCount}</p>
        </div>
      </div>
    </div>
  );
}
