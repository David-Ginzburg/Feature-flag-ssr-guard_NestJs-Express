import { FeatureFlags } from "@/entities/feature-flag";

interface FeatureFlagsListProps {
	flags: FeatureFlags;
}

export default function FeatureFlagsList({ flags }: FeatureFlagsListProps) {
	return (
		<div className="mt-8">
			<h2 className="text-xl font-semibold mb-4">Available Features:</h2>
			<ul className="space-y-2">
				<li>Analytics: {flags.canViewAnalytics ? "✅" : "❌"}</li>
				<li>Content Editing: {flags.canEditContent ? "✅" : "❌"}</li>
				<li>Admin Dashboard: {flags.showAdminDashboard ? "✅" : "❌"}</li>
				<li>Settings Access: {flags.canAccessSettings ? "✅" : "❌"}</li>
			</ul>
		</div>
	);
}
