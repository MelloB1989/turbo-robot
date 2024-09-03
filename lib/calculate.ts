type RevenueResult = {
  month: number;
  existingCustomers: number;
  newCustomers: number;
  totalCustomers: number;
  existingProjects: number;
  revenue: number;
  affiliateRevenue: number;
};

export const calculateRevenueAndAffiliate = (
  referredCustomersPerMonth: number,
  avgNewProjectsPerMonth: number,
  avgExistingProjects: number,
  baseNewProjectRevenue: number = 95, // Base revenue per new project
  baseExistingProjectRevenue: number = 0.25, // Base revenue per existing project
  affiliateRate: number = 0.2, // Default affiliate rate (20%)
  churnRate: number = 0.02, // Default churn rate (2%)
  months: number = 12 // Default calculation for 12 months
): RevenueResult[] => {
  const results: RevenueResult[] = [];
  let totalReferredCustomers: number = 0;

  for (let i = 0; i < months; i++) {
    // Apply churn rate to existing customers
    totalReferredCustomers = Math.max(
      0,
      totalReferredCustomers * (1 - churnRate)
    );

    // Add new referrals
    totalReferredCustomers += referredCustomersPerMonth;

    // Calculate revenue using the formula: D6 * (($B$2 * 95) + ($E6 * 0.25))
    const revenue: number =
      totalReferredCustomers *
      (avgNewProjectsPerMonth * baseNewProjectRevenue +
        avgExistingProjects * baseExistingProjectRevenue);

    // Calculate affiliate revenue
    const affiliateRevenue: number = revenue * affiliateRate;

    results.push({
      month: i + 1,
      existingCustomers: Math.round(totalReferredCustomers),
      newCustomers: referredCustomersPerMonth,
      totalCustomers: Math.round(totalReferredCustomers),
      existingProjects: avgExistingProjects,
      revenue: parseFloat(revenue.toFixed(2)),
      affiliateRevenue: parseFloat(affiliateRevenue.toFixed(2)),
    });

    // Update the existing projects for the next month
    avgExistingProjects += avgNewProjectsPerMonth; // Increase by the number of new projects
  }

  return results;
};
