import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BillingClient from "./BillingClient";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return <div>Please log in</div>;
  }

  const tenantId = (session.user as any).tenantId;
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) return <div>Tenant not found</div>;

  const isPro = Boolean(
    tenant.stripePriceId &&
    tenant.stripeCurrentPeriodEnd && 
    tenant.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
  );

  const isTrial = Boolean(!tenant.stripePriceId && tenant.stripeCurrentPeriodEnd && tenant.stripeCurrentPeriodEnd.getTime() > Date.now());
  const isExpired = !isPro && !isTrial;
  
  const currentPeriodEnd = tenant.stripeCurrentPeriodEnd ? tenant.stripeCurrentPeriodEnd.toLocaleDateString() : "";
  const periodEndDate = tenant.stripeCurrentPeriodEnd;
  const daysLeft = periodEndDate 
    ? Math.max(0, Math.ceil((periodEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <BillingClient 
      isPro={isPro} 
      isTrial={isTrial}
      isExpired={isExpired}
      currentPeriodEnd={currentPeriodEnd}
      hasSubscription={!!tenant.stripeSubscriptionId}
      daysLeft={daysLeft}
    />
  );
}
