import React, { useState, useEffect } from 'react';
import api from '../api';
import { Search, Filter, Tag } from 'lucide-react';

const TicketList = ({ refreshTrigger, onStatusUpdate }) => {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priority: '',
    status: '',
  });

  useEffect(() => {
    const fetchTickets = async () => {
      let query = `?search=${filters.search}&category=${filters.category}&priority=${filters.priority}&status=${filters.status}`;
      const response = await api.get(`/tickets/${query}`);
      setTickets(response.data);
    };
    fetchTickets();
  }, [filters, refreshTrigger]);

  const updateStatus = async (id, newStatus) => {
    await api.patch(`/tickets/${id}/`, { status: newStatus });
    onStatusUpdate();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            placeholder="Search tickets..."
            className="pl-10 w-full border border-gray-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          className="border border-gray-200 p-2 rounded-lg outline-none"
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {['billing', 'technical', 'account', 'general'].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="border border-gray-200 p-2 rounded-lg outline-none"
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
        >
          <option value="">All Priorities</option>
          {['low', 'medium', 'high', 'critical'].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-gray-800">
                {ticket.title}
              </h3>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${getPriorityColor(ticket.priority)}`}
              >
                {ticket.priority}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {ticket.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex space-x-3 text-xs text-gray-500 items-center">
                <span className="flex items-center">
                  <Tag size={12} className="mr-1" /> {ticket.category}
                </span>
                <span>
                  • {new Date(ticket.created_at).toLocaleDateString()}
                </span>
              </div>
              <select
                value={ticket.status}
                onChange={(e) => updateStatus(ticket.id, e.target.value)}
                className="text-sm border border-gray-200 p-1.5 rounded-md bg-gray-50 font-medium"
              >
                {['open', 'in_progress', 'resolved', 'closed'].map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getPriorityColor = (p) => {
  switch (p) {
    case 'critical':
      return 'bg-red-100 text-red-700';
    case 'high':
      return 'bg-orange-100 text-orange-700';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-green-100 text-green-700';
  }
};

export default TicketList;
