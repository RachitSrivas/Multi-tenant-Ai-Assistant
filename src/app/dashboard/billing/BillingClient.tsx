"use client";

import { useState } from "react";

interface BillingProps {
  isPro: boolean;
  isTrial: boolean;
  isExpired: boolean;
  currentPeriodEnd: string;
  hasSubscription: boolean;
  daysLeft: number;
}

export default function BillingClient({ isPro, isTrial, isExpired, currentPeriodEnd, hasSubscription, daysLeft }: BillingProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1000px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Billing & Subscription</h1>
      <p style={{ color: "#94a3b8", marginBottom: "2.5rem" }}>
        Choose the plan that fits your needs. Manage your billing directly through Stripe.
      </p>

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        
        {/* FREE TRIAL BOX */}
        <div style={{ 
          flex: "1 1 300px", 
          backgroundColor: "var(--surface)",
          padding: "2rem",
          borderRadius: "12px",
          border: `2px solid ${isTrial || isExpired ? "var(--primary)" : "var(--surface-border)"}`,
          position: "relative"
        }}>
          {isTrial && (
            <div style={{ position: "absolute", top: "-12px", left: "20px", backgroundColor: "var(--primary)", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold" }}>
              CURRENT PLAN
            </div>
          )}
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Free Trial</h2>
          <div style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem" }}>$0 <span style={{ fontSize: "1rem", color: "#94a3b8", fontWeight: 400 }}>/ 3 days</span></div>
          
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem 0", color: "#e2e8f0", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <li>✓ Unlimited URL Scraping</li>
            <li>✓ Custom Chatbot Branding</li>
            <li>✓ Real-time Chat Inbox</li>
          </ul>

          <div style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "8px" }}>
            {isPro && <div style={{ color: "#94a3b8" }}>Trial completed.</div>}
            {isTrial && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.875rem", color: "#e2e8f0" }}>Days Remaining</span>
                  <span style={{ fontSize: "0.875rem", fontWeight: "bold", color: "var(--primary)" }}>{daysLeft} / 3</span>
                </div>
                <div style={{ width: "100%", backgroundColor: "var(--surface-border)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${(daysLeft / 3) * 100}%`, backgroundColor: "var(--primary)", height: "100%" }}></div>
                </div>
                <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#94a3b8" }}>Ends on {currentPeriodEnd}</div>
              </>
            )}
            {isExpired && <div style={{ color: "var(--error)", fontWeight: 500 }}>Your free trial has ended.</div>}
          </div>
        </div>

        {/* PRO PLAN BOX */}
        <div style={{ 
          flex: "1 1 300px", 
          backgroundColor: "var(--surface)",
          padding: "2rem",
          borderRadius: "12px",
          border: `2px solid ${isPro ? "var(--success)" : "var(--surface-border)"}`,
          position: "relative"
        }}>
          {isPro && (
            <div style={{ position: "absolute", top: "-12px", left: "20px", backgroundColor: "var(--success)", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold" }}>
              CURRENT PLAN
            </div>
          )}
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Pro Plan</h2>
          <div style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem" }}>$12 <span style={{ fontSize: "1rem", color: "#94a3b8", fontWeight: 400 }}>/ month</span></div>
          
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem 0", color: "#e2e8f0", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <li>✓ Everything in Free Trial</li>
            <li>✓ Keep your bot active 24/7</li>
            <li>✓ Priority Email Support</li>
          </ul>

          <div style={{ marginTop: "auto" }}>
            {hasSubscription ? (
              <button 
                onClick={handleManage}
                disabled={loading}
                style={{
                  width: "100%", padding: "0.875rem", backgroundColor: "transparent", color: "var(--foreground)",
                  border: "1px solid var(--surface-border)", borderRadius: "6px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Redirecting..." : "Manage Billing (Stripe)"}
              </button>
            ) : (
              <button 
                onClick={handleUpgrade}
                disabled={loading}
                style={{
                  width: "100%", padding: "0.875rem", backgroundColor: "var(--primary)", color: "white",
                  border: "none", borderRadius: "6px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)"
                }}
              >
                {loading ? "Redirecting..." : "Upgrade to Pro"}
              </button>
            )}
            
            {isPro && currentPeriodEnd && (
              <div style={{ marginTop: "1rem", fontSize: "0.75rem", color: "#94a3b8", textAlign: "center" }}>
                Renews on {currentPeriodEnd}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
