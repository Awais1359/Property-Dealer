import React, { useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, Phone, MessageCircle, User } from 'lucide-react';
import Modal from './common/Modal';
import { Client, Property } from '../types';
import { generateId, formatCurrency } from '../utils/storage';

interface ClientModuleProps {
  clients: Client[];
  properties?: Property[];
  onAdd: (client: Client) => void;
  onUpdate: (client: Client) => void;
  onDelete: (id: string) => void;
}

const ClientModule: React.FC<ClientModuleProps> = ({
  clients,
  properties = [],
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    whatsapp: '',
    type: 'Buyer' as Client['type'],
    budget: 0,
    budgetNotes: '',
    additionalNotes: '',
    propertyId: '' as Client['propertyId']
  });

  const getPropertyLabel = (pid?: string) => {
    if (!pid) return '';
    const p = properties.find(pr => pr.id === pid || pr.propertyId === pid);
    return p ? `${p.propertyId} • ${p.type} • ${p.size.value} ${p.size.unit}` : '';
  };

  const filteredClients = useMemo(() => clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.mobile.includes(searchTerm) ||
      client.whatsapp.includes(searchTerm) ||
      getPropertyLabel(client.propertyId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'All' || client.type === filterType;

    return matchesSearch && matchesType;
  }), [clients, searchTerm, filterType, properties]);

  const openModal = (client?: Client) => {
    if (client) {
      setSelectedClient(client);
      setFormData({
        name: client.name,
        mobile: client.mobile,
        whatsapp: client.whatsapp,
        type: client.type,
        budget: client.budget,
        budgetNotes: client.budgetNotes,
        additionalNotes: client.additionalNotes,
        propertyId: client.propertyId || ''
      });
    } else {
      setSelectedClient(null);
      setFormData({
        name: '',
        mobile: '',
        whatsapp: '',
        type: 'Buyer',
        budget: 0,
        budgetNotes: '',
        additionalNotes: '',
        propertyId: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const clientData: Client = {
      id: selectedClient?.id || generateId(),
      name: formData.name,
      mobile: formData.mobile,
      whatsapp: formData.whatsapp,
      type: formData.type,
      budget: formData.budget,
      budgetNotes: formData.budgetNotes,
      additionalNotes: formData.additionalNotes,
      propertyId: formData.propertyId || undefined,
      createdAt: selectedClient?.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (selectedClient) {
      onUpdate(clientData);
    } else {
      onAdd(clientData);
    }

    setIsModalOpen(false);
  };

  const getTypeColor = (type: Client['type']) => {
    return type === 'Buyer' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Client Management</h2>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Types</option>
            <option value="Buyer">Buyer</option>
            <option value="Seller">Seller</option>
          </select>
        </div>
      </div>

      {/* Table View (desktop) */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.length > 0 ? (
                filteredClients.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.mobile}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${c.type === 'Buyer' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>{c.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{c.budget > 0 ? formatCurrency(c.budget) : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getPropertyLabel(c.propertyId) || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => openModal(c)} className="text-blue-600 hover:text-blue-900 p-1 transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(c.id)} className="text-red-600 hover:text-red-900 p-1 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No clients found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card Grid (mobile/tablet) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:hidden">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{client.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(client.type)}`}>
                      {client.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{client.mobile}</span>
                </div>
                {client.whatsapp && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    <span>{client.whatsapp}</span>
                  </div>
                )}
                {client.propertyId && (
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Property:</span> {getPropertyLabel(client.propertyId)}
                  </div>
                )}
              </div>

              {client.budget > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatCurrency(client.budget)}
                  </p>
                </div>
              )}

              {client.additionalNotes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 truncate" title={client.additionalNotes}>
                    {client.additionalNotes}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => openModal(client)}
                  className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDelete(client.id)}
                  className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedClient ? 'Edit Client' : 'Add New Client'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Client['type'] })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Buyer">Buyer</option>
              <option value="Seller">Seller</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Property</label>
            <select
              value={formData.propertyId}
              onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- None --</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.propertyId} • {p.type} • {p.size.value} {p.size.unit} • {p.location.area}, {p.location.city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget (PKR)</label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget Notes</label>
            <input
              type="text"
              value={formData.budgetNotes}
              onChange={(e) => setFormData({ ...formData, budgetNotes: e.target.value })}
              placeholder="e.g., Cash payment, Bank loan approved"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              rows={3}
              placeholder="e.g., Serious buyer, Looking for immediate purchase"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {selectedClient ? 'Update' : 'Add'} Client
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientModule;