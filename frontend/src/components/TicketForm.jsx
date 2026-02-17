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
    if (formData.description.length < 10) return;

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
      console.error('Classification error:', err);
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
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">New Support Ticket</h2>
        <Sparkles className="text-purple-500" size={20} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Issue Title
        </label>
        <input
          required
          placeholder="Brief summary of the issue"
          className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Detailed Description
        </label>
        <textarea
          required
          placeholder="Please describe your problem in detail..."
          className="w-full border border-gray-200 p-2.5 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none transition"
          value={formData.description}
          onBlur={handleDescriptionBlur}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
        {classifying && (
          <div className="flex items-center mt-2 text-sm text-purple-600 animate-pulse">
            <Loader2 className="animate-spin mr-2" size={14} />
            AI is analyzing and suggesting tags...
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Category
          </label>
          <select
            className="w-full border border-gray-200 p-2.5 rounded-lg bg-gray-50 cursor-pointer"
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
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Priority
          </label>
          <select
            className="w-full border border-gray-200 p-2.5 rounded-lg bg-gray-50 cursor-pointer"
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
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center hover:bg-blue-700 active:scale-[0.98] transition disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <>
            <Send size={18} className="mr-2" /> Submit Ticket
          </>
        )}
      </button>
    </form>
  );
};

export default TicketForm;
