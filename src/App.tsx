import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  Handshake, 
  BarChart3, 
  Shield, 
  Building,
  Bell,
  Menu,
  X,
  Key
} from 'lucide-react';
import PropertyModule from './components/PropertyModule';
import ClientModule from './components/ClientModule';
import DealsModule from './components/DealsModule';
import ReportsModule from './components/ReportsModule';
import BackupModule from './components/BackupModule';
import RentingModule from './components/RentingModule';
import { useDatabase } from './hooks/useDatabase';

function App() {
  const [activeModule, setActiveModule] = useState('properties');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const {
    isInitialized,
    useLocalStorage,
    properties,
    clients,
    rentings,
    deals,
    reminders,
    addProperty,
    updateProperty,
    deleteProperty,
    addClient,
    updateClient,
    deleteClient,
    addRenting,
    updateRenting,
    deleteRenting,
    addDeal,
    updateDeal,
    deleteDeal,
    loadData
  } = useDatabase();

  // Get overdue reminders count
  const overdueCount = reminders.filter(r => 
    !r.completed && new Date(r.dueDate) < new Date()
  ).length;

  const modules = [
    { id: 'properties', name: 'Properties', icon: Home, component: PropertyModule },
    { id: 'clients', name: 'Clients', icon: Users, component: ClientModule },
    { id: 'rentings', name: 'Rent Management', icon: Key, component: RentingModule },
    { id: 'deals', name: 'Deals', icon: Handshake, component: DealsModule },
    { id: 'reports', name: 'Reports', icon: BarChart3, component: ReportsModule },
    { id: 'backup', name: 'Backup & Security', icon: Shield, component: BackupModule }
  ];

  const activeModuleData = modules.find(m => m.id === activeModule);
  const ActiveComponent = activeModuleData?.component;

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const hamburger = document.getElementById('hamburger');
      
      if (isSidebarOpen && sidebar && !sidebar.contains(event.target as Node) && 
          hamburger && !hamburger.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Close sidebar when module changes on mobile
  const handleModuleChange = (moduleId: string) => {
    setActiveModule(moduleId);
    setIsSidebarOpen(false);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Property Dealer</h2>
          <p className="text-gray-600">Initializing database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3">
            {/* Hamburger Menu for Mobile */}
            <button
              id="hamburger"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className={`w-6 h-6 text-gray-600 transition-transform duration-300 ${isSidebarOpen ? 'rotate-90' : 'rotate-0'}`} />
            </button>
            
            <Building className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">Property Dealer</h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {activeModuleData?.name} • Management System
              </p>
            </div>
          </div>
          
          {overdueCount > 0 && (
            <div className="flex items-center space-x-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg">
              <Bell className="w-4 h-4" />
              <span className="text-sm font-medium">{overdueCount} overdue reminder{overdueCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" />
        )}

        {/* Sidebar */}
        <nav 
          id="sidebar"
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg lg:shadow-sm border-r transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b lg:hidden">
            <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="space-y-2">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => handleModuleChange(module.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors ${
                    activeModule === module.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <module.icon className="w-5 h-5" />
                    <span className="font-medium">{module.name}</span>
                  </div>
                  
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 w-full lg:w-auto transition-all duration-300">
          {ActiveComponent && (
            <ActiveComponent
              properties={properties}
              clients={clients}
              rentings={rentings}
              deals={deals}
              reminders={reminders}
              onAdd={activeModule === 'properties' ? addProperty : 
                     activeModule === 'clients' ? addClient : 
                     activeModule === 'rentings' ? addRenting : 
                     activeModule === 'deals' ? addDeal : undefined}
              onUpdate={activeModule === 'properties' ? updateProperty :
                       activeModule === 'clients' ? updateClient :
                       activeModule === 'rentings' ? updateRenting :
                       activeModule === 'deals' ? updateDeal : undefined}
              onDelete={activeModule === 'properties' ? deleteProperty :
                       activeModule === 'clients' ? deleteClient :
                       activeModule === 'rentings' ? deleteRenting :
                       activeModule === 'deals' ? deleteDeal : undefined}
              onDataImport={loadData}
              isAuthenticated={isAuthenticated}
              onAuthChange={setIsAuthenticated}
              useLocalStorage={useLocalStorage}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;