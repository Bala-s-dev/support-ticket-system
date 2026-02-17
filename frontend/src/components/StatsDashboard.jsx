import React, { useEffect, useState } from 'react';
import api from '../api';
import { BarChart3, Ticket, Clock, AlertCircle } from 'lucide-react';

const StatsDashboard = ({ refreshTrigger }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/tickets/stats/');
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch aggregated metrics', err);
      }
    };
    fetchStats();
  }, [refreshTrigger]);

  if (!stats)
    return (
      <div className="animate-pulse h-32 bg-slate-100 rounded-xl mb-8"></div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <StatCard
        icon={<Ticket size={20} />}
        label="Total Tickets"
        value={stats.total_tickets}
        color="bg-blue-50 text-blue-600"
      />
      <StatCard
        icon={<Clock size={20} />}
        label="Open"
        value={stats.open_tickets}
        color="bg-amber-50 text-amber-600"
      />
      <StatCard
        icon={<BarChart3 size={20} />}
        label="Avg / Day"
        value={stats.avg_tickets_per_day}
        color="bg-emerald-50 text-emerald-600"
      />
      <StatCard
        icon={<AlertCircle size={20} />}
        label="Critical"
        value={stats.priority_breakdown.critical || 0}
        color="bg-rose-50 text-rose-600"
      />
    </div>
  );
};

const StatCard = React.memo(({ icon, label, value, color }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md hover:border-indigo-100">
    <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
));

export default StatsDashboard;
