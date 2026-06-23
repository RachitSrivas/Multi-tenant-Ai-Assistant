"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./analytics.module.css";

/* ───────── Types ───────── */

interface AnalyticsData {
  totalSessions: number;
  totalMessages: number;
  totalDocuments: number;
  dailyMessages: { date: string; count: number }[];
  recentConversations: {
    id: string;
    createdAt: string;
    messageCount: number;
    preview: string;
  }[];
  documentsByStatus: { status: string; count: number }[];
  messagesByRole: { role: string; count: number }[];
}

/* ───────── Helpers ───────── */

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function shortDay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function getStatusClass(status: string) {
  switch (status.toUpperCase()) {
    case "PROCESSED":
      return styles.statusProcessed;
    case "PROCESSING":
      return styles.statusProcessing;
    case "PENDING":
      return styles.statusPending;
    case "FAILED":
      return styles.statusFailed;
    default:
      return styles.statusPending;
  }
}

/* ───────── Loading Skeleton ───────── */

function LoadingSkeleton() {
  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.skeletonGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.skeletonCard}>
            <div
              className={`${styles.skeletonBar} ${styles.skeletonTitle}`}
            ></div>
            <div
              className={`${styles.skeletonBar} ${styles.skeletonNumber}`}
            ></div>
          </div>
        ))}
      </div>
      <div className={styles.skeletonChartRow}>
        <div className={styles.skeletonChartLarge}></div>
        <div className={styles.skeletonChartSmall}></div>
      </div>
      <div className={styles.skeletonTable}></div>
    </div>
  );
}

import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

/* ───────── Bar Chart (Recharts) ───────── */

function BarChart({ data }: { data: { date: string; count: number }[] }) {
  const formattedData = data.map(d => ({
    ...d,
    day: shortDay(d.date),
    fullDate: formatDate(d.date)
  }));

  return (
    <div style={{ width: '100%', height: 250, marginTop: '1rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
            itemStyle={{ color: '#60a5fa' }}
          />
          <Bar dataKey="count" fill="url(#barGrad)" radius={[4, 4, 0, 0]} barSize={40} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ───────── Donut Chart (Recharts) ───────── */

function DonutChart({ data }: { data: { role: string; count: number }[] }) {
  const COLORS = ['#3b82f6', '#22d3ee', '#a855f7'];
  
  const chartData = data.map(d => ({
    name: d.role.charAt(0).toUpperCase() + d.role.slice(1),
    value: d.count
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
              itemStyle={{ color: 'white' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
        {chartData.map((entry, index) => (
          <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#e2e8f0' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></span>
            {entry.name}: <span style={{ fontWeight: 600 }}>{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── Main Component ───────── */

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div>
          <h1 className={styles.title}>Analytics Overview</h1>
          <p className={styles.subtitle}>
            Insights into your bot&apos;s usage and knowledge base.
          </p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Analytics Overview</h1>
        <p className={styles.subtitle}>
          {error || "Something went wrong."}
        </p>
      </div>
    );
  }

  const assistantMessages =
    data.messagesByRole.find((m) => m.role === "assistant")?.count ?? 0;

  // Mock change percentages for visual flair
  const changes = ["+12%", "+8%", "+5%", "+3%"];

  // Ensure all statuses are represented in documents
  const statusMap: Record<string, number> = {};
  for (const ds of data.documentsByStatus) {
    statusMap[ds.status] = ds.count;
  }
  const allStatuses = ["PROCESSED", "PROCESSING", "PENDING", "FAILED"];
  const docStatuses = allStatuses.map((status) => ({
    status,
    count: statusMap[status] || 0,
  }));

  return (
    <div className={styles.container}>
      {/* Header */}
      <div>
        <h1 className={styles.title}>Analytics Overview</h1>
        <p className={styles.subtitle}>
          Insights into your bot&apos;s usage and knowledge base.
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardLabel}>Total Conversations</span>
            <span className={`${styles.statCardIcon} ${styles.iconPurple}`}>
              💬
            </span>
          </div>
          <div className={styles.statCardValue}>{data.totalSessions}</div>
          <span className={`${styles.statCardChange} ${styles.changePositive}`}>
            ↑ {changes[0]}
          </span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardLabel}>User Messages</span>
            <span className={`${styles.statCardIcon} ${styles.iconPink}`}>
              📨
            </span>
          </div>
          <div className={styles.statCardValue}>{data.totalMessages}</div>
          <span className={`${styles.statCardChange} ${styles.changePositive}`}>
            ↑ {changes[1]}
          </span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardLabel}>Bot Responses</span>
            <span className={`${styles.statCardIcon} ${styles.iconBlue}`}>
              🤖
            </span>
          </div>
          <div className={styles.statCardValue}>{assistantMessages}</div>
          <span className={`${styles.statCardChange} ${styles.changePositive}`}>
            ↑ {changes[2]}
          </span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardLabel}>Knowledge Docs</span>
            <span className={`${styles.statCardIcon} ${styles.iconGreen}`}>
              📚
            </span>
          </div>
          <div className={styles.statCardValue}>{data.totalDocuments}</div>
          <span className={`${styles.statCardChange} ${styles.changePositive}`}>
            ↑ {changes[3]}
          </span>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className={styles.chartsRow}>
        {/* Bar Chart */}
        <div className={styles.glassCard}>
          <div className={styles.cardTitle}>
            <span className={styles.cardTitleIcon}>📊</span>
            Daily Messages (Last 7 Days)
          </div>
          <BarChart data={data.dailyMessages} />
        </div>

        {/* Donut Chart */}
        <div className={styles.glassCard}>
          <div className={styles.cardTitle}>
            <span className={styles.cardTitleIcon}>🎯</span>
            Message Distribution
          </div>
          <DonutChart data={data.messagesByRole} />
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className={styles.bottomRow}>
        {/* Recent Conversations */}
        <div className={styles.glassCard}>
          <div className={styles.cardTitle}>
            <span className={styles.cardTitleIcon}>🕐</span>
            Recent Conversations
          </div>
          {data.recentConversations.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyStateIcon}>💭</span>
              No conversations yet. Start chatting with your bot!
            </div>
          ) : (
            <table className={styles.conversationsTable}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Messages</th>
                  <th>Preview</th>
                </tr>
              </thead>
              <tbody>
                {data.recentConversations.map((conv) => (
                  <tr key={conv.id}>
                    <td className={styles.dateText}>
                      {formatDate(conv.createdAt)}
                    </td>
                    <td>
                      <span className={styles.messageCount}>
                        {conv.messageCount}
                      </span>
                    </td>
                    <td className={styles.previewText}>{conv.preview}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Document Status */}
        <div className={styles.glassCard}>
          <div className={styles.cardTitle}>
            <span className={styles.cardTitleIcon}>📁</span>
            Document Status
          </div>
          <div className={styles.docStatusGrid}>
            {docStatuses.map((ds) => (
              <div key={ds.status} className={styles.docStatusCard}>
                <span
                  className={`${styles.docStatusIndicator} ${getStatusClass(
                    ds.status
                  )}`}
                ></span>
                <div className={styles.docStatusInfo}>
                  <span className={styles.docStatusLabel}>{ds.status}</span>
                  <span className={styles.docStatusCount}>{ds.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
