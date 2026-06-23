import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import styles from "./admin.module.css";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const totalTenants = await prisma.tenant.count();
  const totalUsers = await prisma.user.count();
  const totalBots = await prisma.bot.count();
  const totalDocuments = await prisma.document.count();
  const totalMessages = await prisma.chatMessage.count({
    where: { role: "user" }
  });

  // Fetch all tenants with aggregated details
  const tenants = await prisma.tenant.findMany({
    include: {
      users: true,
      bots: {
        include: {
          _count: {
            select: { sessions: true }
          }
        }
      },
      _count: {
        select: { documents: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Platform Overview</h1>
      <p className={styles.subtitle}>Global metrics across all tenants.</p>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>Total Tenants</div>
          <div className={styles.cardNumber}>{totalTenants}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardHeader}>Total Users</div>
          <div className={styles.cardNumber}>{totalUsers}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardHeader}>Active Bots</div>
          <div className={styles.cardNumber}>{totalBots}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardHeader}>Documents Ingested</div>
          <div className={styles.cardNumber}>{totalDocuments}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardHeader}>Total Interactions</div>
          <div className={styles.cardNumber}>{totalMessages}</div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Tenant Details</h2>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tenant Name</th>
              <th>Joined Date</th>
              <th>Subscription</th>
              <th>Users</th>
              <th>Documents</th>
              <th>Bot Status</th>
              <th>Chat Sessions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => {
              const hasBot = tenant.bots.length > 0;
              const bot = hasBot ? tenant.bots[0] : null;
              
              const isPro = !!(tenant.stripePriceId && tenant.stripeCurrentPeriodEnd?.getTime()! + 86_400_000 > Date.now());
              const isTrial = !tenant.stripePriceId && tenant.stripeCurrentPeriodEnd && tenant.stripeCurrentPeriodEnd.getTime() > Date.now();
              const isExpired = !isPro && !isTrial;

              return (
                <tr key={tenant.id}>
                  <td style={{ fontWeight: 500 }}>{tenant.name}</td>
                  <td style={{ color: "#a1a1aa" }}>{new Date(tenant.createdAt).toLocaleDateString()}</td>
                  <td>
                    {isPro && <span className={styles.badge} style={{ background: "rgba(34, 197, 94, 0.1)", color: "#4ade80" }}>Pro Plan</span>}
                    {isTrial && <span className={styles.badge} style={{ background: "rgba(59, 130, 246, 0.1)", color: "#60a5fa" }}>Free Trial</span>}
                    {isExpired && <span className={styles.badge} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>Expired</span>}
                  </td>
                  <td>{tenant.users.length}</td>
                  <td>{tenant._count.documents}</td>
                  <td>
                    {hasBot ? (
                      <span className={styles.badge} style={{ background: "rgba(34, 197, 94, 0.1)", color: "#4ade80" }}>Configured</span>
                    ) : (
                      <span className={styles.badge} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>Pending setup</span>
                    )}
                  </td>
                  <td>{bot?._count.sessions || 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
