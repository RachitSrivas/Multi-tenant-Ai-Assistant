"use client";

import Link from "next/link";
import { MessageSquare, Zap, Globe, Shield, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#030712", // Very dark blue/black
      color: "#f8fafc",
      fontFamily: "Inter, sans-serif",
      overflowX: "hidden"
    }}>
      
      {/* Navbar */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1.5rem 4rem",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.5rem", fontWeight: 800, background: "linear-gradient(to right, #60a5fa, #c084fc)", WebkitBackgroundClip: "text", color: "transparent" }}>
          <MessageSquare size={28} color="#60a5fa" />
          NovaChat
        </div>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <Link href="#features" style={{ color: "#cbd5e1", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "white"} onMouseOut={e => e.currentTarget.style.color = "#cbd5e1"}>Features</Link>
          <Link href="#pricing" style={{ color: "#cbd5e1", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "white"} onMouseOut={e => e.currentTarget.style.color = "#cbd5e1"}>Pricing</Link>
          <Link href="/login" style={{ color: "#cbd5e1", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "white"} onMouseOut={e => e.currentTarget.style.color = "#cbd5e1"}>Login</Link>
          <Link href="/register" style={{
            padding: "0.5rem 1.25rem",
            backgroundColor: "#3b82f6",
            color: "white",
            borderRadius: "999px",
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
            transition: "transform 0.2s, boxShadow 0.2s"
          }}
          onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.6)"; }}
          onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(59, 130, 246, 0.4)"; }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "8rem 2rem",
        position: "relative"
      }}>
        {/* Background Glow */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "800px", height: "800px", background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)", zIndex: 0, pointerEvents: "none" }}></div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: "800px" }}>
          <div style={{ display: "inline-block", padding: "0.25rem 1rem", backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#60a5fa", borderRadius: "999px", fontSize: "0.875rem", fontWeight: 600, marginBottom: "2rem", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
            ✨ The Next Generation of Customer Support
          </div>
          <h1 style={{ fontSize: "4.5rem", fontWeight: 800, lineHeight: 1.1, marginBottom: "1.5rem" }}>
            Build your custom AI <br/>
            <span style={{ background: "linear-gradient(to right, #60a5fa, #c084fc)", WebkitBackgroundClip: "text", color: "transparent" }}>in under 2 minutes.</span>
          </h1>
          <p style={{ fontSize: "1.25rem", color: "#94a3b8", marginBottom: "3rem", lineHeight: 1.6, maxWidth: "600px", margin: "0 auto 3rem auto" }}>
            Scrape your website, upload your PDFs, and deploy a stunning, hyper-intelligent chatbot to your website instantly. Zero coding required.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Link href="/register" style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "1rem 2rem",
              backgroundColor: "#3b82f6",
              color: "white",
              borderRadius: "8px",
              fontSize: "1.125rem",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
            }}>
              Start your 3-day Free Trial <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: "6rem 4rem", backgroundColor: "#020617" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem" }}>Everything you need</h2>
          <p style={{ color: "#94a3b8", fontSize: "1.125rem" }}>Powerful tools built for modern businesses.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
          
          <div style={{ padding: "2rem", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px" }}>
            <div style={{ width: "50px", height: "50px", backgroundColor: "rgba(59, 130, 246, 0.1)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa", marginBottom: "1.5rem" }}>
              <Globe size={24} />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Website Auto-Scraping</h3>
            <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>Just paste your URL. We automatically crawl and learn everything about your business instantly.</p>
          </div>

          <div style={{ padding: "2rem", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px" }}>
            <div style={{ width: "50px", height: "50px", backgroundColor: "rgba(168, 85, 247, 0.1)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc", marginBottom: "1.5rem" }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Live Conversation Inbox</h3>
            <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>Monitor exactly what your customers are asking your bot in real-time through our beautiful inbox.</p>
          </div>

          <div style={{ padding: "2rem", backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px" }}>
            <div style={{ width: "50px", height: "50px", backgroundColor: "rgba(34, 197, 94, 0.1)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#4ade80", marginBottom: "1.5rem" }}>
              <Shield size={24} />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Enterprise Security</h3>
            <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>Domain whitelisting, IP rate limiting, and fully isolated multi-tenant architecture keeps your data safe.</p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "4rem", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "1.25rem", fontWeight: 800, color: "white", marginBottom: "1rem" }}>
          <MessageSquare size={20} color="#60a5fa" />
          NovaChat
        </div>
        <p style={{ color: "#64748b" }}>© 2026 NovaChat Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
