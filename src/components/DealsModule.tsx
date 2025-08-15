import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import Modal from './common/Modal';
import FileUpload from './common/FileUpload';
import { Deal, PaymentSchedule, Property, Client } from '../types';
import { generateId, formatCurrency, formatDate } from '../utils/storage';

interface DealsModuleProps {
  deals: Deal[];
  properties: Property[];
  clients: Client[];
  onAdd: (deal: Deal) => void;
  onUpdate: (deal: Deal) => void;
  onDelete: (id: string) => void;
}

const DealsModule: React.FC<DealsModuleProps> = ({
  deals,
  properties,
  clients,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const [formData, setFormData] = useState({
    propertyId: '',
    buyerId: '',
    sellerId: '',
    agreedPrice: 0,
    commission: 0,
    agreementFiles: [] as string[],
    status: 'Active' as Deal['status'],
    paymentSchedule: [] as PaymentSchedule[]
  });

  const [newPayment, setNewPayment] = useState({
    amount: 0,
    dueDate: '',
    notes: ''
  });

  const filteredDeals = deals.filter(deal => {
    const property = properties.find(p => p.id === deal.propertyId);
    const buyer = clients.find(c => c.id === deal.buyerId);
    const seller = clients.find(c => c.id === deal.sellerId);
    
    const matchesSearch = 
      property?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property?.propertyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || deal.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const openModal = (deal?: Deal) => {
    if (deal) {
      setSelectedDeal(deal);
      setFormData({
        propertyId: deal.propertyId,
        buyerId: deal.buyerId,
        sellerId: deal.sellerId,
        agreedPrice: deal.agreedPrice,
        commission: deal.commission || 0,
        agreementFiles: deal.agreementFiles,
        status: deal.status,
        paymentSchedule: deal.paymentSchedule
      });
    } else {
      setSelectedDeal(null);
      setFormData({
        propertyId: '',
        buyerId: '',
        sellerId: '',
        agreedPrice: 0,
        commission: 0,
        agreementFiles: [],
        status: 'Active',
        paymentSchedule: []
      });
    }
    setIsModalOpen(true);
  };

  const addPayment = () => {
    if (newPayment.amount > 0 && newPayment.dueDate) {
      const payment: PaymentSchedule = {
        id: generateId(),
        amount: newPayment.amount,
        dueDate: new Date(newPayment.dueDate),
        paid: false,
        notes: newPayment.notes
      };

      setFormData({
        ...formData,
        paymentSchedule: [...formData.paymentSchedule, payment]
      });

      setNewPayment({ amount: 0, dueDate: '', notes: '' });
    }
  };

  const removePayment = (paymentId: string) => {
    setFormData({
      ...formData,
      paymentSchedule: formData.paymentSchedule.filter(p => p.id !== paymentId)
    });
  };

  const togglePaymentStatus = (paymentId: string) => {
    setFormData({
      ...formData,
      paymentSchedule: formData.paymentSchedule.map(p => 
        p.id === paymentId 
          ? { ...p, paid: !p.paid, paidDate: !p.paid ? new Date() : undefined }
          : p
      )
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dealData: Deal = {
      id: selectedDeal?.id || generateId(),
      propertyId: formData.propertyId,
      buyerId: formData.buyerId,
      sellerId: formData.sellerId,
      agreedPrice: formData.agreedPrice,
      commission: formData.commission,
      agreementFiles: formData.agreementFiles,
      status: formData.status,
      paymentSchedule: formData.paymentSchedule,
      createdAt: selectedDeal?.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (selectedDeal) {
      onUpdate(dealData);
    } else {
      onAdd(dealData);
    }

    setIsModalOpen(false);
  };

  const getStatusColor = (status: Deal['status']) => {
    const colors = {
      Active: 'bg-green-100 text-green-800',
      Completed: 'bg-blue-100 text-blue-800',
      Cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getProperty = (propertyId: string) => 
    properties.find(p => p.id === propertyId);

  const getClient = (clientId: string) => 
    clients.find(c => c.id === clientId);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Deals Management</h2>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Deal</span>
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
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDeals.map((deal) => {
          const property = getProperty(deal.propertyId);
          const buyer = getClient(deal.buyerId);
          const seller = getClient(deal.sellerId);
          const totalPaid = deal.paymentSchedule.reduce((sum, p) => sum + (p.paid ? p.amount : 0), 0);
          const totalDue = deal.paymentSchedule.reduce((sum, p) => sum + p.amount, 0);

          return (
            <div key={deal.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{property?.name}</h3>
                    <p className="text-sm text-gray-500">{property?.propertyId}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                    {deal.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Buyer:</span>
                    <span className="text-gray-800">{buyer?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Seller:</span>
                    <span className="text-gray-800">{seller?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Agreed Price:</span>
                    <span className="text-gray-800 font-semibold">
                      {formatCurrency(deal.agreedPrice)}
                    </span>
                  </div>
                  {deal.commission && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Commission:</span>
                      <span className="text-gray-800">{formatCurrency(deal.commission)}</span>
                    </div>
                  )}
                </div>

                {deal.paymentSchedule.length > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">Payment Progress:</span>
                      <span className="text-gray-800">
                        {formatCurrency(totalPaid)} / {formatCurrency(totalDue)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${totalDue > 0 ? (totalPaid / totalDue) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(deal)}
                    className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(deal.id)}
                    className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDeal ? 'Edit Deal' : 'Add New Deal'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
              <select
                required
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Property</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.propertyId} - {property.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Deal['status'] })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buyer</label>
              <select
                required
                value={formData.buyerId}
                onChange={(e) => setFormData({ ...formData, buyerId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Buyer</option>
                {clients.filter(c => c.type === 'Buyer').map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.mobile}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seller</label>
              <select
                required
                value={formData.sellerId}
                onChange={(e) => setFormData({ ...formData, sellerId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Seller</option>
                {clients.filter(c => c.type === 'Seller').map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.mobile}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Agreed Price (PKR)</label>
              <input
                type="number"
                required
                value={formData.agreedPrice}
                onChange={(e) => setFormData({ ...formData, agreedPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Commission (PKR)</label>
              <input
                type="number"
                value={formData.commission}
                onChange={(e) => setFormData({ ...formData, commission: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Payment Schedule */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Payment Schedule</h3>
            
            {/* Add New Payment */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-3">Add Payment</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="number"
                  placeholder="Amount"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={newPayment.dueDate}
                  onChange={(e) => setNewPayment({ ...newPayment, dueDate: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addPayment}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Payment List */}
            {formData.paymentSchedule.length > 0 && (
              <div className="space-y-2">
                {formData.paymentSchedule.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => togglePaymentStatus(payment.id)}
                        className={`p-1 rounded-full ${payment.paid ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <div>
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">{formatCurrency(payment.amount)}</span>
                          <span className="text-sm text-gray-500">
                            Due: {formatDate(payment.dueDate)}
                          </span>
                          {payment.notes && (
                            <span className="text-sm text-gray-600">({payment.notes})</span>
                          )}
                        </div>
                        {payment.paid && payment.paidDate && (
                          <p className="text-xs text-green-600">
                            Paid on {formatDate(payment.paidDate)}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePayment(payment.id)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <FileUpload
            files={formData.agreementFiles}
            onFilesChange={(files) => setFormData({ ...formData, agreementFiles: files })}
            label="Agreement Files"
          />

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
              {selectedDeal ? 'Update' : 'Add'} Deal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default DealsModule;