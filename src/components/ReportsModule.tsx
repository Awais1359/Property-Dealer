import React, { useState } from 'react';
import { Download, FileText, TrendingUp, DollarSign, Home, Users } from 'lucide-react';
import { Property, Client, Deal, PaymentSchedule } from '../types';
import { formatCurrency, formatDate, exportToExcel } from '../utils/storage';

interface ReportsModuleProps {
  properties: Property[];
  clients: Client[];
  deals: Deal[];
}

const ReportsModule: React.FC<ReportsModuleProps> = ({
  properties,
  clients,
  deals
}) => {
  const [selectedReport, setSelectedReport] = useState('dashboard');

  // Dashboard Statistics
  const stats = {
    totalProperties: properties.length,
    availableProperties: properties.filter(p => p.status === 'Available').length,
    soldProperties: properties.filter(p => p.status === 'Sold').length,
    rentedProperties: properties.filter(p => p.status === 'Rented').length,
    totalClients: clients.length,
    buyers: clients.filter(c => c.type === 'Buyer').length,
    sellers: clients.filter(c => c.type === 'Seller').length,
    activeDeals: deals.filter(d => d.status === 'Active').length,
    completedDeals: deals.filter(d => d.status === 'Completed').length,
    totalRevenue: deals.reduce((sum, deal) => sum + deal.agreedPrice, 0),
    totalCommission: deals.reduce((sum, deal) => sum + (deal.commission || 0), 0)
  };

  // Get payment due information
  const getPaymentDueData = () => {
    const paymentsDue: Array<{
      dealId: string;
      propertyName: string;
      clientName: string;
      amount: number;
      dueDate: Date;
      isOverdue: boolean;
    }> = [];

    deals.forEach(deal => {
      const property = properties.find(p => p.id === deal.propertyId);
      const client = clients.find(c => c.id === deal.buyerId);
      
      deal.paymentSchedule.forEach(payment => {
        if (!payment.paid) {
          paymentsDue.push({
            dealId: deal.id,
            propertyName: property?.name || 'Unknown',
            clientName: client?.name || 'Unknown',
            amount: payment.amount,
            dueDate: payment.dueDate,
            isOverdue: new Date(payment.dueDate) < new Date()
          });
        }
      });
    });

    return paymentsDue.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  const exportAvailableProperties = () => {
    const data = properties
      .filter(p => p.status === 'Available')
      .map(property => ({
        'Property ID': property.propertyId,
        'Name': property.name,
        'Type': property.type,
        'Location': `${property.location.area}, ${property.location.city}`,
        'Size': `${property.size.value} ${property.size.unit}`,
        'Price': property.price,
        'Status': property.status,
        'Notes': property.notes
      }));
    
    exportToExcel(data, 'Available_Properties_Report');
  };

  const exportSoldProperties = () => {
    const soldPropertiesData = properties
      .filter(p => p.status === 'Sold')
      .map(property => {
        const deal = deals.find(d => d.propertyId === property.id && d.status === 'Completed');
        return {
          'Property ID': property.propertyId,
          'Name': property.name,
          'Type': property.type,
          'Location': `${property.location.area}, ${property.location.city}`,
          'Size': `${property.size.value} ${property.size.unit}`,
          'Original Price': property.price,
          'Sale Price': deal?.agreedPrice || 0,
          'Sale Date': deal ? formatDate(deal.updatedAt) : 'N/A',
          'Commission': deal?.commission || 0
        };
      });
    
    exportToExcel(soldPropertiesData, 'Sold_Properties_Report');
  };

  const exportPaymentDue = () => {
    const paymentsDue = getPaymentDueData();
    const data = paymentsDue.map(payment => ({
      'Property': payment.propertyName,
      'Client': payment.clientName,
      'Amount Due': payment.amount,
      'Due Date': formatDate(payment.dueDate),
      'Status': payment.isOverdue ? 'Overdue' : 'Pending'
    }));
    
    exportToExcel(data, 'Payment_Due_Report');
  };

  const exportClientsReport = () => {
    const data = clients.map(client => ({
      'Name': client.name,
      'Mobile': client.mobile,
      'WhatsApp': client.whatsapp,
      'Type': client.type,
      'Budget': client.budget,
      'Budget Notes': client.budgetNotes,
      'Additional Notes': client.additionalNotes,
      'Created Date': formatDate(client.createdAt)
    }));
    
    exportToExcel(data, 'Clients_Report');
  };

  const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
      </div>

      {/* Report Navigation */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="flex flex-wrap border-b">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'available', label: 'Available Properties', icon: Home },
            { id: 'sold', label: 'Sold Properties', icon: FileText },
            { id: 'payments', label: 'Payment Due', icon: DollarSign },
            { id: 'clients', label: 'Clients', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedReport(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                selectedReport === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard */}
      {selectedReport === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Properties"
              value={stats.totalProperties}
              icon={<Home className="w-6 h-6" />}
              color="bg-blue-100 text-blue-600"
            />
            <StatCard
              title="Available Properties"
              value={stats.availableProperties}
              icon={<Home className="w-6 h-6" />}
              color="bg-green-100 text-green-600"
            />
            <StatCard
              title="Total Clients"
              value={stats.totalClients}
              icon={<Users className="w-6 h-6" />}
              color="bg-purple-100 text-purple-600"
            />
            <StatCard
              title="Active Deals"
              value={stats.activeDeals}
              icon={<FileText className="w-6 h-6" />}
              color="bg-orange-100 text-orange-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Property Status Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Available</span>
                  <span className="font-semibold text-green-600">{stats.availableProperties}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sold</span>
                  <span className="font-semibold text-red-600">{stats.soldProperties}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rented</span>
                  <span className="font-semibold text-blue-600">{stats.rentedProperties}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Deal Value</span>
                  <span className="font-semibold">{formatCurrency(stats.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Commission</span>
                  <span className="font-semibold text-green-600">{formatCurrency(stats.totalCommission)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed Deals</span>
                  <span className="font-semibold">{stats.completedDeals}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Properties Report */}
      {selectedReport === 'available' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Available Properties ({stats.availableProperties})</h3>
            <button
              onClick={exportAvailableProperties}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export to Excel</span>
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.filter(p => p.status === 'Available').map(property => (
                    <tr key={property.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{property.name}</div>
                          <div className="text-sm text-gray-500">{property.propertyId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {property.location.area}, {property.location.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {property.type} • {property.size.value} {property.size.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(property.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sold Properties Report */}
      {selectedReport === 'sold' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Sold Properties ({stats.soldProperties})</h3>
            <button
              onClick={exportSoldProperties}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export to Excel</span>
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.filter(p => p.status === 'Sold').map(property => {
                    const deal = deals.find(d => d.propertyId === property.id);
                    return (
                      <tr key={property.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{property.name}</div>
                            <div className="text-sm text-gray-500">{property.propertyId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(property.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          {formatCurrency(deal?.agreedPrice || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                          {formatCurrency(deal?.commission || 0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payment Due Report */}
      {selectedReport === 'payments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Payment Due List</h3>
            <button
              onClick={exportPaymentDue}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export to Excel</span>
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getPaymentDueData().map((payment, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.propertyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.clientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.isOverdue 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.isOverdue ? 'Overdue' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Clients Report */}
      {selectedReport === 'clients' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Clients List ({stats.totalClients})</h3>
            <button
              onClick={exportClientsReport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export to Excel</span>
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map(client => (
                    <tr key={client.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {client.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {client.mobile}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          client.type === 'Buyer' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {client.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {client.budget > 0 ? formatCurrency(client.budget) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsModule;