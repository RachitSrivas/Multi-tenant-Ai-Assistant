"use client";

import { useState, useEffect } from "react";

export default function BotCustomization() {
  const [name, setName] = useState("My Assistant");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [colorScheme, setColorScheme] = useState("#3b82f6");
  const [welcomeMessage, setWelcomeMessage] = useState("Hi there! How can I help you?");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [allowedDomain, setAllowedDomain] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch existing config
    fetch("/api/bot")
      .then((res) => res.json())
      .then((data) => {
        if (data.bot) {
          setName(data.bot.name || "My Assistant");
          setSystemPrompt(data.bot.systemPrompt || "");
          setColorScheme(data.bot.colorScheme || "#3b82f6");
          setWelcomeMessage(data.bot.welcomeMessage || "Hi there! How can I help you?");
          setAvatarUrl(data.bot.avatarUrl || "");
          setAllowedDomain(data.bot.allowedDomain || "");
        }
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/bot", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, systemPrompt, colorScheme, welcomeMessage, avatarUrl, allowedDomain }),
      });

      if (res.ok) {
        setMessage("Settings saved successfully!");
      } else {
        setMessage("Failed to save settings.");
      }
    } catch (e) {
      setMessage("An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 500px", maxWidth: "800px" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Bot Customization</h1>
        <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
          Configure how your AI assistant looks and behaves when interacting with your customers.
        </p>

        <form onSubmit={handleSave} style={{ 
          display: "flex", flexDirection: "column", gap: "1.5rem",
          backgroundColor: "var(--surface)",
          padding: "2rem",
          borderRadius: "8px",
          border: "1px solid var(--surface-border)"
        }}>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Bot Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%", padding: "0.75rem", borderRadius: "6px",
                border: "1px solid var(--surface-border)", backgroundColor: "#151822", color: "white"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Avatar Image URL (Optional)</label>
            <input 
              type="url" 
              placeholder="https://example.com/logo.png"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              style={{
                width: "100%", padding: "0.75rem", borderRadius: "6px",
                border: "1px solid var(--surface-border)", backgroundColor: "#151822", color: "white"
              }}
            />
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem" }}>Provide a public link to your company logo or bot avatar.</p>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Allowed Domain (Optional)</label>
            <input 
              type="url" 
              placeholder="https://mycompany.com"
              value={allowedDomain}
              onChange={(e) => setAllowedDomain(e.target.value)}
              style={{
                width: "100%", padding: "0.75rem", borderRadius: "6px",
                border: "1px solid var(--surface-border)", backgroundColor: "#151822", color: "white"
              }}
            />
            <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem" }}>Restrict the chat widget to only work on this specific website domain to prevent abuse.</p>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Color Scheme</label>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <input 
                type="color" 
                value={colorScheme}
                onChange={(e) => setColorScheme(e.target.value)}
                style={{
                  width: "50px", height: "50px", padding: "0", border: "none",
                  borderRadius: "6px", cursor: "pointer", background: "transparent"
                }}
              />
              <span style={{ fontFamily: "monospace" }}>{colorScheme}</span>
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Welcome Message</label>
            <input 
              type="text" 
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              style={{
                width: "100%", padding: "0.75rem", borderRadius: "6px",
                border: "1px solid var(--surface-border)", backgroundColor: "#151822", color: "white"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>System Prompt (Instructions)</label>
            <p style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "0.5rem" }}>
              Tell the AI how to behave. (e.g. "You are a helpful support agent for Acme Corp. Be concise.")
            </p>
            <textarea 
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={5}
              style={{
                width: "100%", padding: "0.75rem", borderRadius: "6px",
                border: "1px solid var(--surface-border)", backgroundColor: "#151822", color: "white",
                resize: "vertical"
              }}
            />
          </div>

          <button 
            type="submit"
            disabled={saving}
            style={{
              padding: "0.75rem", backgroundColor: "var(--primary)", color: "white",
              border: "none", borderRadius: "6px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
              marginTop: "1rem"
            }}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>

          {message && (
            <div style={{ 
              marginTop: "1rem", padding: "1rem", 
              backgroundColor: message.includes("success") ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
              color: message.includes("success") ? "var(--success)" : "var(--error)",
              borderRadius: "6px", border: `1px solid ${message.includes("success") ? "var(--success)" : "var(--error)"}`
            }}>
              {message}
            </div>
          )}
        </form>
      </div>

      {/* Widget Preview (Simple) */}
      <div style={{ flex: "1 1 300px", position: "relative" }}>
        <h3 style={{ marginBottom: "1rem" }}>Preview</h3>
        <div style={{
          width: "350px", height: "500px", border: "1px solid var(--surface-border)",
          borderRadius: "12px", overflow: "hidden", backgroundColor: "white",
          display: "flex", flexDirection: "column", boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
        }}>
          {/* Header */}
          <div style={{ 
            backgroundColor: colorScheme, color: "white", padding: "15px", 
            fontWeight: 600, display: "flex", alignItems: "center", gap: "10px" 
          }}>
            {avatarUrl && (
              <img src={avatarUrl} alt="Avatar" style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }} />
            )}
            {name}
          </div>
          {/* Body */}
          <div style={{ flex: 1, backgroundColor: "#f8fafc", padding: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ 
              alignSelf: "flex-start", backgroundColor: "white", color: "#1e293b", 
              padding: "10px 14px", borderRadius: "18px", borderBottomLeftRadius: "4px",
              border: "1px solid #e2e8f0", fontSize: "14px", display: "flex", gap: "8px", alignItems: "flex-end"
            }}>
              {avatarUrl && (
                <img src={avatarUrl} alt="Avatar" style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              )}
              {welcomeMessage}
            </div>
          </div>
          {/* Input */}
          <div style={{ padding: "15px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "10px" }}>
            <div style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: "20px", padding: "10px", color: "#94a3b8", fontSize: "14px" }}>
              Type a message...
            </div>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: colorScheme, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 24 24" style={{ width: "18px", height: "18px", fill: "white" }}><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
