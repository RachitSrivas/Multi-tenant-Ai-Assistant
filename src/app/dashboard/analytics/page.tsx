import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import AnalyticsDashboard from "./AnalyticsDashboard";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  return <AnalyticsDashboard />;
}
