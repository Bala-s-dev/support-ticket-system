import React, { useState, useEffect } from 'react';
import api from '../api';
import { Search, Tag, Calendar, ChevronRight } from 'lucide-react';

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
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== ''),
        ),
      );
      try {
        const response = await api.get(`/tickets/?${params.toString()}`);
        setTickets(response.data);
      } catch (err) {
        console.error('Error fetching ticket list', err);
      }
    };
    fetchTickets();
  }, [filters, refreshTrigger]);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/tickets/${id}/`, { status: newStatus });
      onStatusUpdate(); // Refresh stats and list [cite: 1176]
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar  */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            placeholder="Search title or description..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            className="flex-1 sm:w-40 p-2 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none cursor-pointer"
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
          >
            <option value="">All Categories</option>
            {['billing', 'technical', 'account', 'general'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="flex-1 sm:w-40 p-2 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none cursor-pointer"
            value={filters.priority}
            onChange={(e) =>
              setFilters({ ...filters, priority: e.target.value })
            }
          >
            <option value="">All Priorities</option>
            {['low', 'medium', 'high', 'critical'].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ticket Cards List [cite: 1173, 1174] */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
            No tickets found matching your criteria.
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {ticket.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs font-medium uppercase tracking-wider">
                    <span
                      className={`px-2 py-0.5 rounded ${getPriorityStyle(ticket.priority)}`}
                    >
                      {ticket.priority}
                    </span>
                    <span className="flex items-center text-slate-400">
                      <Tag size={12} className="mr-1" /> {ticket.category}
                    </span>
                  </div>
                </div>
                <select
                  value={ticket.status}
                  onChange={(e) => updateStatus(ticket.id, e.target.value)}
                  className={`text-xs font-bold py-1.5 px-3 rounded-full border-0 cursor-pointer outline-none ${getStatusStyle(ticket.status)}`}
                >
                  {['open', 'in_progress', 'resolved', 'closed'].map((s) => (
                    <option
                      key={s}
                      value={s}
                      className="bg-white text-slate-800"
                    >
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Truncated Description  */}
              <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">
                {ticket.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(ticket.created_at).toLocaleDateString(undefined, {
                    dateStyle: 'medium',
                  })}
                </div>
                <button className="flex items-center gap-1 text-indigo-500 font-semibold hover:underline">
                  View Details <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const getPriorityStyle = (p) => {
  switch (p) {
    case 'critical':
      return 'bg-rose-100 text-rose-700';
    case 'high':
      return 'bg-orange-100 text-orange-700';
    case 'medium':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-emerald-100 text-emerald-700';
  }
};

const getStatusStyle = (s) => {
  switch (s) {
    case 'resolved':
      return 'bg-emerald-600 text-white hover:bg-emerald-700';
    case 'in_progress':
      return 'bg-indigo-600 text-white hover:bg-indigo-700';
    case 'closed':
      return 'bg-slate-500 text-white hover:bg-slate-600';
    default:
      return 'bg-amber-500 text-white hover:bg-amber-600';
  }
};

export default TicketList;
