"use client";

import { useState, useEffect } from "react";

interface Document {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
}

export default function KnowledgeHub() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeMessage, setScrapeMessage] = useState("");

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document? The AI will forget its contents.")) return;

    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments(documents.filter(d => d.id !== id));
      } else {
        alert("Failed to delete document.");
      }
    } catch (e) {
      alert("Error deleting document.");
    }
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setScraping(true);
    setScrapeMessage("");

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (res.ok) {
        setScrapeMessage("Website scraped and added to Knowledge Base!");
        setUrl("");
        fetchDocuments(); // Refresh table
      } else {
        setScrapeMessage(data.error || "Scraping failed");
      }
    } catch (error) {
      setScrapeMessage("An unexpected error occurred");
    } finally {
      setScraping(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("File uploaded and processed successfully!");
        setFile(null);
        fetchDocuments(); // Refresh table
      } else {
        setMessage(data.error || "Upload failed");
      }
    } catch (error) {
      setMessage("An unexpected error occurred");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Knowledge Hub</h1>
      <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
        Manage your company's PDFs, handbooks, and URLs. Our AI will automatically process and learn from them.
      </p>

      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "3rem" }}>
        {/* Upload Form */}
        <div style={{
          backgroundColor: "var(--surface)",
          padding: "2rem",
          borderRadius: "8px",
          border: "1px solid var(--surface-border)",
          flex: "1 1 400px"
        }}>
          <h3 style={{ marginBottom: "1rem" }}>Upload PDF</h3>
          <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#94a3b8" }}>Select PDF Document</label>
              <input 
                type="file" 
                accept=".pdf,.txt" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#151822",
                  border: "1px dashed var(--surface-border)",
                  borderRadius: "6px",
                  color: "var(--foreground)"
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={!file || uploading}
              style={{
                padding: "0.75rem",
                backgroundColor: "var(--primary)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: (!file || uploading) ? "not-allowed" : "pointer",
                opacity: (!file || uploading) ? 0.7 : 1
              }}
            >
              {uploading ? "Processing with AI..." : "Upload & Train AI"}
            </button>
          </form>

          {message && (
            <div style={{ 
              marginTop: "1rem", 
              padding: "1rem", 
              backgroundColor: message.includes("success") ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
              color: message.includes("success") ? "var(--success)" : "var(--error)",
              borderRadius: "6px",
              border: `1px solid ${message.includes("success") ? "var(--success)" : "var(--error)"}`
            }}>
              {message}
            </div>
          )}
        </div>

        {/* URL Scraping Section */}
        <div style={{
          backgroundColor: "var(--surface)",
          padding: "2rem",
          borderRadius: "8px",
          border: "1px solid var(--surface-border)",
          flex: "1 1 400px"
        }}>
          <h3 style={{ marginBottom: "1rem" }}>Scrape URL</h3>
          <form onSubmit={handleScrape} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", color: "#94a3b8" }}>Website URL</label>
              <input 
                type="url" 
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#151822",
                  border: "1px solid var(--surface-border)",
                  borderRadius: "6px",
                  color: "var(--foreground)"
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={!url || scraping}
              style={{
                padding: "0.75rem",
                backgroundColor: "transparent",
                color: "var(--foreground)",
                border: "1px solid var(--primary)",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: (!url || scraping) ? "not-allowed" : "pointer",
                opacity: (!url || scraping) ? 0.7 : 1
              }}
            >
              {scraping ? "Scraping Website..." : "Scrape & Train AI"}
            </button>
          </form>

          {scrapeMessage && (
            <div style={{ 
              marginTop: "1rem", 
              padding: "1rem", 
              backgroundColor: scrapeMessage.includes("scraped") ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
              color: scrapeMessage.includes("scraped") ? "var(--success)" : "var(--error)",
              borderRadius: "6px",
              border: `1px solid ${scrapeMessage.includes("scraped") ? "var(--success)" : "var(--error)"}`
            }}>
              {scrapeMessage}
            </div>
          )}
        </div>
      </div>

      {/* Managed Documents Table */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Managed Documents</h2>
        <button 
          onClick={fetchDocuments}
          style={{
            background: "rgba(255,255,255,0.1)", border: "1px solid var(--surface-border)",
            color: "var(--foreground)", padding: "0.5rem 1rem", borderRadius: "6px",
            cursor: "pointer", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem"
          }}
        >
          ↻ Refresh List
        </button>
      </div>

      <div style={{
        backgroundColor: "var(--surface)",
        borderRadius: "8px",
        border: "1px solid var(--surface-border)",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--surface-border)", backgroundColor: "rgba(0,0,0,0.2)" }}>
              <th style={{ padding: "1rem", textAlign: "left", color: "#94a3b8", fontSize: "0.875rem", fontWeight: 500 }}>Name</th>
              <th style={{ padding: "1rem", textAlign: "left", color: "#94a3b8", fontSize: "0.875rem", fontWeight: 500 }}>Type</th>
              <th style={{ padding: "1rem", textAlign: "left", color: "#94a3b8", fontSize: "0.875rem", fontWeight: 500 }}>Status</th>
              <th style={{ padding: "1rem", textAlign: "left", color: "#94a3b8", fontSize: "0.875rem", fontWeight: 500 }}>Date</th>
              <th style={{ padding: "1rem", textAlign: "right", color: "#94a3b8", fontSize: "0.875rem", fontWeight: 500 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingDocs ? (
              <tr><td colSpan={5} style={{ padding: "1rem", textAlign: "center" }}>Loading documents...</td></tr>
            ) : documents.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: "1rem", textAlign: "center", color: "#71717a" }}>No documents found. Start uploading!</td></tr>
            ) : documents.map((doc) => (
              <tr key={doc.id} style={{ borderBottom: "1px solid rgba(63, 63, 70, 0.4)" }}>
                <td style={{ padding: "1rem", fontSize: "0.875rem", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</td>
                <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                  <span style={{ padding: "0.25rem 0.5rem", borderRadius: "4px", backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#60a5fa", fontSize: "0.75rem" }}>
                    {doc.type}
                  </span>
                </td>
                <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                  {doc.status === "PROCESSED" ? (
                    <span style={{ color: "#4ade80" }}>● Ready</span>
                  ) : doc.status === "PROCESSING" ? (
                    <span style={{ color: "#f59e0b" }}>● Processing</span>
                  ) : (
                    <span style={{ color: "#ef4444" }}>● Failed</span>
                  )}
                </td>
                <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#a1a1aa" }}>{new Date(doc.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--error)",
                      color: "var(--error)",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.75rem"
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
