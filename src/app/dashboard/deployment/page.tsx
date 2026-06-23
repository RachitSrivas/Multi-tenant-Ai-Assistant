import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DeploymentPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const tenantId = (session.user as any).tenantId;

  // In production, this would be your actual domain (e.g. https://my-chatbot-factory.com)
  const hostUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

  const scriptTag = `<script src="${hostUrl}/widget.js" data-tenant-id="${tenantId}" defer></script>`;

  return (
    <div>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Deploy Your Bot</h1>
      <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
        Copy and paste the snippet below into your website's HTML, right before the closing <code>&lt;/body&gt;</code> tag.
      </p>

      <div style={{
        backgroundColor: "var(--surface)",
        padding: "2rem",
        borderRadius: "8px",
        border: "1px solid var(--surface-border)",
        maxWidth: "800px"
      }}>
        <h3 style={{ marginBottom: "1rem", color: "var(--foreground)" }}>Installation Code</h3>
        
        <div style={{
          backgroundColor: "#151822",
          padding: "1.5rem",
          borderRadius: "6px",
          border: "1px solid var(--surface-border)",
          fontFamily: "monospace",
          color: "#22c55e",
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all"
        }}>
          {scriptTag}
        </div>

        <p style={{ marginTop: "1.5rem", fontSize: "0.875rem", color: "#94a3b8" }}>
          This script is completely isolated and won't interfere with your existing website's CSS or functionality. It loads asynchronously to ensure your site remains blazingly fast.
        </p>
      </div>
    </div>
  );
}
