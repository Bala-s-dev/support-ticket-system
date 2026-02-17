import React, { useState } from 'react';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import StatsDashboard from './components/StatsDashboard';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-gray-900">AI Ticket System</h1>
        <p className="text-gray-500">Intelligent support management platform</p>
      </header>

      <StatsDashboard refreshTrigger={refreshTrigger} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <TicketForm onTicketCreated={triggerRefresh} />
        </div>
        <div className="lg:col-span-2">
          <TicketList
            refreshTrigger={refreshTrigger}
            onStatusUpdate={triggerRefresh}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
