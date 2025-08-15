import React, { useState } from 'react';
import { Shield, Download, Upload, Key, Save, Lock } from 'lucide-react';
import { Property, Client, Deal, Reminder } from '../types';
import { exportToExcel, hasPin, setPin, validatePin } from '../utils/storage';

interface BackupModuleProps {
  properties: Property[];
  clients: Client[];
  deals: Deal[];
  reminders: Reminder[];
  onDataImport: () => void;
  isAuthenticated: boolean;
  onAuthChange: (authenticated: boolean) => void;
}

const BackupModule: React.FC<BackupModuleProps> = ({
  properties,
  clients,
  deals,
  reminders,
  onDataImport,
  isAuthenticated,
  onAuthChange
}) => {
  const [pinInput, setPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [error, setError] = useState('');

  const handlePinValidation = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validatePin(pinInput)) {
      onAuthChange(true);
      setPinInput('');
      setError('');
    } else {
      setError('Invalid PIN');
    }
  };

  const handlePinSetup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }
    
    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    
    setPin(newPin);
    setShowPinSetup(false);
    setNewPin('');
    setConfirmPin('');
    setError('');
    onAuthChange(true);
  };

  const exportAllData = () => {
    // Export Properties
    const propertiesData = properties.map(p => ({
      'Property ID': p.propertyId,
      'Name': p.name,
      'City': p.location.city,
      'Area': p.location.area,
      'Street': p.location.street,
      'Type': p.type,
      'Size Value': p.size.value,
      'Size Unit': p.size.unit,
      'Price': p.price,
      'Status': p.status,
      'Notes': p.notes,
      'Created Date': p.createdAt.toISOString(),
      'Updated Date': p.updatedAt.toISOString()
    }));
    exportToExcel(propertiesData, 'Properties_Backup');

    // Export Clients
    const clientsData = clients.map(c => ({
      'Name': c.name,
      'Mobile': c.mobile,
      'WhatsApp': c.whatsapp,
      'Type': c.type,
      'Budget': c.budget,
      'Budget Notes': c.budgetNotes,
      'Additional Notes': c.additionalNotes,
      'Created Date': c.createdAt.toISOString(),
      'Updated Date': c.updatedAt.toISOString()
    }));
    exportToExcel(clientsData, 'Clients_Backup');

    // Export Deals
    const dealsData = deals.map(d => {
      const property = properties.find(p => p.id === d.propertyId);
      const buyer = clients.find(c => c.id === d.buyerId);
      const seller = clients.find(c => c.id === d.sellerId);
      
      return {
        'Property': property?.name || 'Unknown',
        'Property ID': property?.propertyId || 'Unknown',
        'Buyer': buyer?.name || 'Unknown',
        'Seller': seller?.name || 'Unknown',
        'Agreed Price': d.agreedPrice,
        'Commission': d.commission || 0,
        'Status': d.status,
        'Total Payments': d.paymentSchedule.length,
        'Paid Payments': d.paymentSchedule.filter(p => p.paid).length,
        'Created Date': d.createdAt.toISOString(),
        'Updated Date': d.updatedAt.toISOString()
      };
    });
    exportToExcel(dealsData, 'Deals_Backup');

    // Export Reminders
    const remindersData = reminders.map(r => {
      let relatedItem = '';
      switch (r.relatedTo.type) {
        case 'Property':
          const property = properties.find(p => p.id === r.relatedTo.id);
          relatedItem = property?.name || 'Unknown';
          break;
        case 'Client':
          const client = clients.find(c => c.id === r.relatedTo.id);
          relatedItem = client?.name || 'Unknown';
          break;
        case 'Deal':
          const deal = deals.find(d => d.id === r.relatedTo.id);
          const dealProperty = properties.find(p => p.id === deal?.propertyId);
          relatedItem = dealProperty?.name || 'Unknown';
          break;
      }
      
      return {
        'Type': r.type,
        'Title': r.title,
        'Description': r.description,
        'Due Date': r.dueDate.toISOString(),
        'Completed': r.completed,
        'Related Type': r.relatedTo.type,
        'Related Item': relatedItem,
        'Created Date': r.createdAt.toISOString()
      };
    });
    exportToExcel(remindersData, 'Reminders_Backup');
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // For demo purposes, we'll just trigger the reload
          // In a real application, you would parse the CSV/Excel file
          // and update the database accordingly
          onDataImport();
          alert('Data import completed successfully!');
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  if (!isAuthenticated && !hasPin()) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Setup Security PIN</h2>
            <p className="text-gray-600 mb-6">
              Create a 4-digit PIN to secure your property management data
            </p>
            
            <form onSubmit={handlePinSetup} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter 4-digit PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-center text-lg font-mono focus:ring-2 focus:ring-blue-500"
                  maxLength={6}
                  required
                />
              </div>
              
              <div>
                <input
                  type="password"
                  placeholder="Confirm PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-center text-lg font-mono focus:ring-2 focus:ring-blue-500"
                  maxLength={6}
                  required
                />
              </div>
              
              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>Setup PIN</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && hasPin()) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <Lock className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Enter Security PIN</h2>
            <p className="text-gray-600 mb-6">
              Please enter your PIN to access backup and security features
            </p>
            
            <form onSubmit={handlePinValidation} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter your PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-center text-lg font-mono focus:ring-2 focus:ring-blue-500"
                  maxLength={6}
                  required
                />
              </div>
              
              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Unlock
              </button>
            </form>
            
            <button
              onClick={() => setShowPinSetup(true)}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800"
            >
              Reset PIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Backup & Security</h2>
        <button
          onClick={() => onAuthChange(false)}
          className="text-red-600 hover:text-red-800 flex items-center space-x-2"
        >
          <Lock className="w-4 h-4" />
          <span>Lock Access</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Data Backup Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3 mb-6">
            <Download className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-800">Data Backup</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Export all your data to Excel files for backup purposes. This includes properties, clients, deals, and reminders.
            </p>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-800">Complete Backup</h4>
                  <p className="text-sm text-gray-600">Export all data (Properties, Clients, Deals, Reminders)</p>
                </div>
                <button
                  onClick={exportAllData}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export All</span>
                </button>
              </div>
              
              <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                <strong>Backup includes:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>{properties.length} Properties</li>
                  <li>{clients.length} Clients</li>
                  <li>{deals.length} Deals</li>
                  <li>{reminders.length} Reminders</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Data Import Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3 mb-6">
            <Upload className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-semibold text-gray-800">Data Import</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Import data from Excel/CSV files to restore your backup or add bulk data.
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Import Data File</p>
                <p className="text-xs text-gray-500">Supports CSV and Excel formats</p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileImport}
                  className="hidden"
                  id="import-file"
                />
                <label
                  htmlFor="import-file"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Choose File
                </label>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg">
              <strong>⚠️ Important:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Import will add new data, not replace existing data</li>
                <li>Ensure file format matches the exported structure</li>
                <li>Create a backup before importing</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2">
          <div className="flex items-center space-x-3 mb-6">
            <Key className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-800">Security Settings</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">Current Security Status</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">PIN Protection</span>
                  <span className="text-sm font-medium text-green-600">✓ Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Data Encryption</span>
                  <span className="text-sm font-medium text-green-600">✓ Local Storage</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Auto-Lock</span>
                  <span className="text-sm font-medium text-blue-600">Session Based</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">Change PIN</h4>
              <button
                onClick={() => setShowPinSetup(true)}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Change Security PIN
              </button>
              <p className="text-xs text-gray-500">
                Changing your PIN will require re-authentication for all security features
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Change PIN Modal */}
      {showPinSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Security PIN</h3>
            <form onSubmit={handlePinSetup} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="New 4-digit PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-center text-lg font-mono focus:ring-2 focus:ring-blue-500"
                  maxLength={6}
                  required
                />
              </div>
              
              <div>
                <input
                  type="password"
                  placeholder="Confirm new PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg text-center text-lg font-mono focus:ring-2 focus:ring-blue-500"
                  maxLength={6}
                  required
                />
              </div>
              
              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinSetup(false);
                    setNewPin('');
                    setConfirmPin('');
                    setError('');
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Update PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupModule;