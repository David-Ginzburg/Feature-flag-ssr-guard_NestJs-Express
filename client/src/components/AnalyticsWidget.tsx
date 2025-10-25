export default function AnalyticsWidget() {
	return (
		<div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
			<h2 className="text-xl font-semibold mb-4">📊 Analytics Dashboard</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-white p-4 rounded">
					<h3 className="font-semibold">Page Views</h3>
					<p className="text-2xl font-bold text-blue-600">1,234</p>
				</div>
				<div className="bg-white p-4 rounded">
					<h3 className="font-semibold">Users</h3>
					<p className="text-2xl font-bold text-green-600">567</p>
				</div>
				<div className="bg-white p-4 rounded">
					<h3 className="font-semibold">Conversion</h3>
					<p className="text-2xl font-bold text-purple-600">12.5%</p>
				</div>
			</div>
		</div>
	);
}