export default function AdminPanel() {
	return (
		<div className="bg-red-50 p-6 rounded-lg border border-red-200">
			<h2 className="text-xl font-semibold mb-4">🔧 Admin Panel</h2>
			<div className="space-y-4">
				<div className="bg-white p-4 rounded">
					<h3 className="font-semibold">User Management</h3>
					<p className="text-sm text-gray-600">Manage users and permissions</p>
				</div>
				<div className="bg-white p-4 rounded">
					<h3 className="font-semibold">System Settings</h3>
					<p className="text-sm text-gray-600">Configure system-wide settings</p>
				</div>
				<div className="bg-white p-4 rounded">
					<h3 className="font-semibold">Feature Flags</h3>
					<p className="text-sm text-gray-600">Toggle features on/off</p>
				</div>
			</div>
		</div>
	);
}