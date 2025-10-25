import { getFeatureFlags } from "@/lib/flags";

export default async function SettingsPage() {
	const flags = await getFeatureFlags();

	if (!flags.canAccessSettings) {
		return (
			<div className="container mx-auto p-8">
				<h1 className="text-3xl font-bold mb-8">Access Denied</h1>
				<p className="text-red-500">You don't have permission to access settings.</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-8">
			<h1 className="text-3xl font-bold mb-8">Settings</h1>
			<div className="bg-white p-6 rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-4">User Settings</h2>
				<p>Settings form would go here...</p>
			</div>
		</div>
	);
}
