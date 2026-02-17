import React, { useState } from 'react';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import StatsDashboard from './components/StatsDashboard';
import { Layout, Ticket as TicketIcon } from 'lucide-react';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header Section */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <TicketIcon className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight">
                SupportFlow <span className="text-indigo-600">AI</span>
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Dashboard */}
        <StatsDashboard refreshTrigger={refreshTrigger} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sticky Form Side */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <TicketForm onTicketCreated={triggerRefresh} />
          </div>

          {/* Scrollable List Side */}
          <div className="lg:col-span-8">
            <TicketList
              refreshTrigger={refreshTrigger}
              onStatusUpdate={triggerRefresh}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
