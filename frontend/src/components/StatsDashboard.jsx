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
        console.error('Failed to fetch stats', err);
      }
    };
    fetchStats();
  }, [refreshTrigger]);

  if (!stats)
    return <div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div>;

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
        label="Open Tickets"
        value={stats.open_tickets}
        color="bg-yellow-50 text-yellow-600"
      />
      <StatCard
        icon={<BarChart3 size={20} />}
        label="Avg Per Day"
        value={stats.avg_tickets_per_day}
        color="bg-green-50 text-green-600"
      />
      <StatCard
        icon={<AlertCircle size={20} />}
        label="Critical"
        value={stats.priority_breakdown.critical || 0}
        color="bg-red-50 text-red-600"
      />
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
    <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default StatsDashboard;
