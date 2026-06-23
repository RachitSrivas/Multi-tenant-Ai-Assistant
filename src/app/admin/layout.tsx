"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import styles from "./admin.module.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>Super Admin</div>
        
        <nav className={styles.nav}>
          <Link 
            href="/admin" 
            className={`${styles.navLink} ${pathname === "/admin" ? styles.navLinkActive : ""}`}
          >
            Platform Overview
          </Link>
          <Link 
            href="/dashboard" 
            className={styles.navLink}
          >
            Go to Tenant Portal
          </Link>
        </nav>

        <div className={styles.logout}>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className={styles.logoutButton}>
            Sign Out
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <h2>Administration</h2>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
