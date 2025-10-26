import { getFeatureFlags } from "@/entities/feature-flag";
import { AdminPanel } from "@/features/admin";
import AnalyticsWidget from "./AnalyticsWidget";

export default async function DashboardContent() {
	const flags = await getFeatureFlags();

	// Show Admin Panel only for ADMIN role
	if (flags.showAdminDashboard) {
		return <AdminPanel />;
	}

	// Show Analytics Dashboard for EDITOR and ADMIN roles
	if (flags.canViewAnalytics) {
		return <AnalyticsWidget />;
	}

	// Show Regular Dashboard for VIEWER role
	return (
		<div className="bg-gray-100 p-6 rounded-lg">
			<h2 className="text-xl font-semibold mb-4">Regular Dashboard</h2>
			<p>Welcome to your dashboard! You have standard user access.</p>
		</div>
	);
}
