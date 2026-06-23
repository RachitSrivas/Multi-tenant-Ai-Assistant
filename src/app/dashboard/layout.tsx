"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import styles from "./layout.module.css";
import { 
  LayoutDashboard, 
  Database, 
  Bot, 
  Code2, 
  BarChart3, 
  MessageSquare, 
  CreditCard,
  ShieldAlert,
  LogOut
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the NextAuth session manually since we don't have a SessionProvider
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((session) => {
        if (session?.user?.role) {
          setRole(session.user.role);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <MessageSquare size={24} color="#60a5fa" />
          NovaChat
        </div>
        
        <nav className={styles.nav}>
          <Link 
            href="/dashboard" 
            className={`${styles.navLink} ${pathname === "/dashboard" ? styles.navLinkActive : ""}`}
          >
            <LayoutDashboard size={18} /> Overview
          </Link>
          <Link 
            href="/dashboard/knowledge" 
            className={`${styles.navLink} ${pathname === "/dashboard/knowledge" ? styles.navLinkActive : ""}`}
          >
            <Database size={18} /> Knowledge Hub
          </Link>
          <Link 
            href="/dashboard/bot" 
            className={`${styles.navLink} ${pathname === "/dashboard/bot" ? styles.navLinkActive : ""}`}
          >
            <Bot size={18} /> Bot Customization
          </Link>
          <Link 
            href="/dashboard/deployment" 
            className={`${styles.navLink} ${pathname === "/dashboard/deployment" ? styles.navLinkActive : ""}`}
          >
            <Code2 size={18} /> Deployment
          </Link>
          <Link 
            href="/dashboard/analytics" 
            className={`${styles.navLink} ${pathname === "/dashboard/analytics" ? styles.navLinkActive : ""}`}
          >
            <BarChart3 size={18} /> Analytics
          </Link>
          <Link 
            href="/dashboard/inbox" 
            className={`${styles.navLink} ${pathname === "/dashboard/inbox" ? styles.navLinkActive : ""}`}
          >
            <MessageSquare size={18} /> Inbox
          </Link>
          <Link 
            href="/dashboard/billing" 
            className={`${styles.navLink} ${pathname === "/dashboard/billing" ? styles.navLinkActive : ""}`}
          >
            <CreditCard size={18} /> Billing
          </Link>
        </nav>

        <div className={styles.logout}>
          {role === "SUPERADMIN" && (
            <Link 
              href="/admin" 
              className={styles.navLink} 
              style={{ marginBottom: "1rem", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.2)", background: "rgba(245, 158, 11, 0.1)", justifyContent: "center" }}
            >
              <ShieldAlert size={18} /> Admin Dashboard
            </Link>
          )}
          <button onClick={() => signOut({ callbackUrl: "/login" })} className={styles.logoutButton}>
            <LogOut size={18} /> Sign Out
          </button>

        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <h2>Tenant Portal</h2>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
