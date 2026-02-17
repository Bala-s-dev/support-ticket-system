import React, { useState } from 'react';
import api from '../api';
import { Loader2, Send, Sparkles } from 'lucide-react';

const TicketForm = ({ onTicketCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'low',
  });
  const [loading, setLoading] = useState(false);
  const [classifying, setClassifying] = useState(false);

  const handleDescriptionBlur = async () => {
    if (formData.description.trim().length < 10) return;
    setClassifying(true);
    try {
      const response = await api.post('/tickets/classify/', {
        description: formData.description,
      });
      setFormData((prev) => ({
        ...prev,
        category: response.data.suggested_category,
        priority: response.data.suggested_priority,
      }));
    } catch (err) {
      console.error('AI Classification failed', err);
    } finally {
      setClassifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tickets/', formData);
      setFormData({
        title: '',
        description: '',
        category: 'general',
        priority: 'low',
      });
      onTicketCreated();
    } catch (err) {
      alert('Error submitting ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-indigo-600" size={24} />
        <h2 className="text-xl font-bold text-slate-800">New Ticket</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            required
            maxLength={200}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            required
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 h-32"
            value={formData.description}
            onBlur={handleDescriptionBlur}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          {classifying && (
            <p className="text-indigo-600 text-xs mt-1 animate-pulse flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" /> AI suggesting
              tags...
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              className="mt-1 block w-full rounded-md border-slate-300 border p-2 bg-white"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              {['billing', 'technical', 'account', 'general'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Priority
            </label>
            <select
              className="mt-1 block w-full rounded-md border-slate-300 border p-2 bg-white"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
            >
              {['low', 'medium', 'high', 'critical'].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <Send size={18} className="mr-2" /> Submit
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TicketForm;
