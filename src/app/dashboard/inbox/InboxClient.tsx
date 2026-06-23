"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import styles from "./inbox.module.css";

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface ChatSession {
  id: string;
  createdAt: string;
  messages: ChatMessage[];
}

export default function InboxClient() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inbox")
      .then((res) => res.json())
      .then((data) => {
        if (data.sessions) {
          setSessions(data.sessions);
          if (data.sessions.length > 0) {
            setSelectedSessionId(data.sessions[0].id);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load inbox:", err);
        setLoading(false);
      });
  }, []);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Conversation Inbox</h1>
      <p className={styles.subtitle}>View real-time chat transcripts between your users and your AI bot.</p>

      <div className={styles.splitPane}>
        {/* Left Sidebar - Session List */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>Recent Conversations</div>
          
          <div className={styles.sessionList}>
            {loading ? (
              <div className={styles.loadingSpinner}>Loading...</div>
            ) : sessions.length === 0 ? (
              <div className={styles.emptyState}>No conversations found.</div>
            ) : (
              sessions.map((session) => {
                const firstUserMessage = session.messages.find(m => m.role === "user");
                const preview = firstUserMessage ? firstUserMessage.content : "Empty conversation";
                const dateStr = new Date(session.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

                return (
                  <div 
                    key={session.id} 
                    className={`${styles.sessionItem} ${selectedSessionId === session.id ? styles.sessionItemActive : ""}`}
                    onClick={() => setSelectedSessionId(session.id)}
                  >
                    <div className={styles.sessionDate}>
                      <span>{dateStr}</span>
                      <span>{session.messages.length} msgs</span>
                    </div>
                    <div className={styles.sessionPreview}>{preview}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Main Pane - Chat Transcript */}
        <div className={styles.mainPane}>
          {selectedSession ? (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.chatTitle}>Chat Transcript</div>
                <div className={styles.chatId}>ID: {selectedSession.id}</div>
              </div>
              <div className={styles.chatBody}>
                {selectedSession.messages.length === 0 ? (
                  <div className={styles.emptyState}>No messages in this session.</div>
                ) : (
                  selectedSession.messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`${styles.message} ${msg.role === "user" ? styles.messageUser : styles.messageBot}`}
                    >
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              Select a conversation to view the transcript.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
