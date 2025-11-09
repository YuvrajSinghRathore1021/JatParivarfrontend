// frontend/src/admin/pages/Dashboard.jsx
import { useAdminQuery } from '../hooks/useAdminApi.js'

export default function DashboardPage() {
  const { data: summaryData, isLoading } = useAdminQuery(['admin', 'dashboard', 'summary'], '/dashboard/summary')
  const { data: activityData } = useAdminQuery(['admin', 'dashboard', 'activity'], '/dashboard/activity', { staleTime: 30_000 })

  const summary = summaryData || { membersCount: 0, founderCount: 0, paymentsToday: { total: 0, count: 0 }, plans: [] }
  const activity = activityData || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of membership and payments</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Members" value={summary.membersCount} loading={isLoading} />
        <StatCard title="Founders" value={summary.founderCount} loading={isLoading} />
        <StatCard
          title="Today’s Payments"
          value={`₹${(summary.paymentsToday.total / 100 || 0).toLocaleString('en-IN')}`}
          description={`${summary.paymentsToday.count || 0} transactions`}
          loading={isLoading}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow border border-slate-200 p-4">
          <h2 className="text-lg font-semibold mb-3">Members by Plan</h2>
          <ul className="space-y-2">
            {summary.plans?.map((plan) => (
              <li key={plan.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{plan.titleEn}</p>
                  <p className="text-slate-500">₹{plan.price?.toLocaleString('en-IN')}</p>
                </div>
                <span className="text-slate-600">{plan.members} members</span>
              </li>
            ))}
            {(!summary.plans || summary.plans.length === 0) && <p className="text-sm text-slate-500">No plan data yet.</p>}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow border border-slate-200 p-4">
          <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {activity.length === 0 && <p className="text-sm text-slate-500">No recent activity.</p>}
            {activity.map((log) => (
              <li key={log._id} className="text-sm border-b last:border-none border-slate-100 pb-2">
                <p className="font-medium capitalize">{log.action}</p>
                <p className="text-slate-500">{log.summary || log.entityType}</p>
                <p className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, description, loading }) {
  return (
    <div className="bg-white rounded-lg shadow border border-slate-200 p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-semibold mt-2">{loading ? '…' : value}</p>
      {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
    </div>
  )
}
