import React, { useState } from 'react';
import api from '../api';
import { Loader2, Send, Sparkles } from 'lucide-react';

const TicketForm = ({ onTicketCreated }) => {
  // Initial state tracking the fields required by the data model [cite: 9]
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'low',
  });

  const [loading, setLoading] = useState(false); // For the final submission [cite: 54]
  const [classifying, setClassifying] = useState(false); // For the LLM suggestion phase [cite: 55]

  /**
   * Triggers the LLM classification when the user clicks away from the description.
   * Calls the /api/tickets/classify/ endpoint[cite: 13, 36].
   */
  const handleDescriptionBlur = async () => {
    // Only trigger if a meaningful description is provided
    if (formData.description.trim().length < 10) return;

    setClassifying(true);
    try {
      const response = await api.post('/tickets/classify/', {
        description: formData.description,
      });

      // Pre-fill the dropdowns with LLM suggestions [cite: 39, 53]
      setFormData((prev) => ({
        ...prev,
        category: response.data.suggested_category,
        priority: response.data.suggested_priority,
      }));
    } catch (err) {
      console.error(
        'AI Auto-suggestion failed. Proceeding with manual selection.',
        err,
      );
    } finally {
      setClassifying(false);
    }
  };

  /**
   * Submits the final ticket to the backend[cite: 54].
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // POST to /api/tickets/ [cite: 12, 54]
      await api.post('/tickets/', formData);

      // Requirement: Clear the form on success
      setFormData({
        title: '',
        description: '',
        category: 'general',
        priority: 'low',
      });

      // Refresh the parent ticket list without a full page reload
      onTicketCreated();
    } catch (err) {
      alert('Error submitting ticket. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center space-x-2 mb-6">
        <Sparkles className="text-purple-500" size={20} />
        <h2 className="text-xl font-bold text-gray-800">New Support Request</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title Input: Required and Max 200 characters  */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Title
          </label>
          <input
            required
            maxLength={200}
            placeholder="E.g., Cannot access billing dashboard"
            className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        {/* Description Textarea: Triggers LLM onBlur [cite: 39, 52] */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Problem Description
          </label>
          <textarea
            required
            placeholder="Please provide details about the issue..."
            className="w-full border border-gray-200 p-2.5 rounded-lg h-36 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
            value={formData.description}
            onBlur={handleDescriptionBlur}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          {classifying && (
            <div className="flex items-center mt-2 text-xs font-medium text-purple-600 animate-pulse">
              <Loader2 className="animate-spin mr-2" size={12} />
              AI is suggesting category and priority...
            </div>
          )}
        </div>

        {/* Dropdowns for Category and Priority [cite: 9, 53] */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Category
            </label>
            <select
              className="w-full border border-gray-200 p-2.5 rounded-lg bg-gray-50 cursor-pointer focus:border-blue-500"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="account">Account</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Priority
            </label>
            <select
              className="w-full border border-gray-200 p-2.5 rounded-lg bg-gray-50 cursor-pointer focus:border-blue-500"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Submit Button with Loading State [cite: 54, 55] */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <Send size={18} className="mr-2" />
              Submit Ticket
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TicketForm;
