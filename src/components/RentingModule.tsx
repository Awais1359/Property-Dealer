import React, { useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, MapPin, Home, Key } from 'lucide-react';
import Modal from './common/Modal';
import FileUpload from './common/FileUpload';
import { Renting } from '../types';
import { generateId, generateRentingId, formatCurrency } from '../utils/storage';

interface RentingModuleProps {
  rentings: Renting[];
  onAdd: (renting: Renting) => void;
  onUpdate: (renting: Renting) => void;
  onDelete: (id: string) => void;
  useLocalStorage?: boolean;
}

const RentingModule: React.FC<RentingModuleProps> = ({
  rentings,
  onAdd,
  onUpdate,
  onDelete,
  useLocalStorage: _useLocalStorage = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<Renting | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | Renting['propertyType']>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | Renting['availabilityStatus']>('All');

  const [formData, setFormData] = useState({
    title: '',
    propertyType: 'House' as Renting['propertyType'],
    city: '',
    area: '',
    street: '',
    fullAddress: '',
    sizeValue: 0,
    sizeUnit: 'Marla' as Renting['size']['unit'],
    rentAmount: 0,
    securityDeposit: 0,
    furnished: 'Unfurnished' as Renting['furnished'],
    availabilityStatus: 'Available' as Renting['availabilityStatus'],
    phoneNumber: '',
    amenities: '' as string, // comma separated
    leaseType: 'Yearly' as Renting['leaseDuration']['type'],
    leaseValue: 12,
    leaseCustomPeriod: '',
    paymentSchedule: 'Monthly' as Renting['paymentSchedule'],
    additionalNotes: '',
    images: [] as string[],
    documents: [] as string[],
  });

  const filtered = useMemo(() => {
    return rentings.filter((r) => {
      const s = searchTerm.toLowerCase();
      const matchesSearch =
        r.title.toLowerCase().includes(s) ||
        r.rentingId.toLowerCase().includes(s) ||
        r.location.city.toLowerCase().includes(s) ||
        r.location.area.toLowerCase().includes(s) ||
        (r.phoneNumber || '').includes(searchTerm);
      const matchesType = filterType === 'All' || r.propertyType === filterType;
      const matchesStatus = filterStatus === 'All' || r.availabilityStatus === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [rentings, searchTerm, filterType, filterStatus]);

  const openModal = (r?: Renting) => {
    if (r) {
      setSelected(r);
      setFormData({
        title: r.title,
        propertyType: r.propertyType,
        city: r.location.city,
        area: r.location.area,
        street: r.location.street,
        fullAddress: r.location.fullAddress,
        sizeValue: r.size.value,
        sizeUnit: r.size.unit,
        rentAmount: r.rentAmount,
        securityDeposit: r.securityDeposit,
        furnished: r.furnished,
        availabilityStatus: r.availabilityStatus,
        phoneNumber: r.phoneNumber,
        amenities: (r.amenities || []).join(', '),
        leaseType: r.leaseDuration.type,
        leaseValue: r.leaseDuration.value,
        leaseCustomPeriod: r.leaseDuration.customPeriod || '',
        paymentSchedule: r.paymentSchedule,
        additionalNotes: r.additionalNotes,
        images: r.images,
        documents: r.documents,
      });
    } else {
      setSelected(null);
      setFormData({
        title: '',
        propertyType: 'House',
        city: '',
        area: '',
        street: '',
        fullAddress: '',
        sizeValue: 0,
        sizeUnit: 'Marla',
        rentAmount: 0,
        securityDeposit: 0,
        furnished: 'Unfurnished',
        availabilityStatus: 'Available',
        phoneNumber: '',
        amenities: '',
        leaseType: 'Yearly',
        leaseValue: 12,
        leaseCustomPeriod: '',
        paymentSchedule: 'Monthly',
        additionalNotes: '',
        images: [],
        documents: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const renting: Renting = {
      id: selected?.id || generateId(),
      rentingId:
        selected?.rentingId || generateRentingId(rentings.map((x) => x.rentingId)),
      propertyType: formData.propertyType,
      title: formData.title,
      location: {
        city: formData.city,
        area: formData.area,
        street: formData.street,
        fullAddress: formData.fullAddress,
      },
      size: {
        value: formData.sizeValue,
        unit: formData.sizeUnit,
      },
      rentAmount: formData.rentAmount,
      securityDeposit: formData.securityDeposit,
      furnished: formData.furnished,
      availabilityStatus: formData.availabilityStatus,
      phoneNumber: formData.phoneNumber,
      amenities: formData.amenities
        ? formData.amenities.split(',').map((a) => a.trim()).filter(Boolean)
        : [],
      leaseDuration: {
        type: formData.leaseType,
        value: formData.leaseValue,
        customPeriod: formData.leaseType === 'Custom' ? formData.leaseCustomPeriod || undefined : undefined,
      },
      paymentSchedule: formData.paymentSchedule,
      additionalNotes: formData.additionalNotes,
      images: formData.images,
      documents: formData.documents,
      createdAt: selected?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (selected) onUpdate(renting);
    else onAdd(renting);

    setIsModalOpen(false);
  };

  const statusColor = (status: Renting['availabilityStatus']) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Rented':
        return 'bg-blue-100 text-blue-800';
      case 'Reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'Under Negotiation':
        return 'bg-orange-100 text-orange-800';
      case 'Maintenance':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Rent Management</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Using Firebase Firestore for data storage
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Rent</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search rents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
          >
            <option value="All">All Types</option>
            <option value="House">House</option>
            <option value="Plot">Plot</option>
            <option value="Flat">Flat</option>
            <option value="Apartment">Apartment</option>
            <option value="Shop">Shop</option>
            <option value="Office">Office</option>
            <option value="Warehouse">Warehouse</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Rented">Rented</option>
            <option value="Under Negotiation">Under Negotiation</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Reserved">Reserved</option>
          </select>
        </div>
      </div>

      {/* Table View (desktop) */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Rent ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Type & Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Rent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length > 0 ? (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.rentingId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {r.location.area}, {r.location.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Home className="w-4 h-4 mr-1 text-gray-400" />
                        {r.propertyType} • {r.size.value} {r.size.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(r.rentAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor(r.availabilityStatus)}`}>
                        {r.availabilityStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.phoneNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => openModal(r)} className="text-green-600 hover:text-green-900 p-1 transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(r.id)} className="text-red-600 hover:text-red-900 p-1 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No rents found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card View (mobile) */}
      <div className="lg:hidden space-y-4 max-h-[70vh] overflow-y-auto">
        {filtered.length > 0 ? (
          filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-3 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{r.title}</h3>
                    <p className="text-emerald-600 font-medium text-sm">{r.rentingId}</p>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${statusColor(r.availabilityStatus)}`}>
                    {r.availabilityStatus}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900">{r.location.area}, {r.location.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Home className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Type & Size</p>
                      <p className="text-sm font-medium text-gray-900">{r.propertyType} • {r.size.value} {r.size.unit}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Key className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rent</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(r.rentAmount)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                <div className="flex justify-end space-x-2">
                  <button onClick={() => openModal(r)} className="flex items-center space-x-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button onClick={() => onDelete(r.id)} className="flex items-center space-x-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Rents Found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selected ? 'Edit Rent' : 'Add New Rent'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as Renting['propertyType'] })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="House">House</option>
                <option value="Plot">Plot</option>
                <option value="Flat">Flat</option>
                <option value="Apartment">Apartment</option>
                <option value="Shop">Shop</option>
                <option value="Office">Office</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
              <input
                type="text"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
              <input
                type="text"
                value={formData.fullAddress}
                onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  required
                  value={formData.sizeValue}
                  onChange={(e) => setFormData({ ...formData, sizeValue: Number(e.target.value) })}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
                <select
                  value={formData.sizeUnit}
                  onChange={(e) => setFormData({ ...formData, sizeUnit: e.target.value as Renting['size']['unit'] })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Marla">Marla</option>
                  <option value="Kanal">Kanal</option>
                  <option value="Sqft">Sqft</option>
                  <option value="Sqm">Sqm</option>
                </select>
              </div>
            </div>

            

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rent Amount (PKR)</label>
              <input
                type="number"
                required
                value={formData.rentAmount}
                onChange={(e) => setFormData({ ...formData, rentAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit (PKR)</label>
              <input
                type="number"
                value={formData.securityDeposit}
                onChange={(e) => setFormData({ ...formData, securityDeposit: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing</label>
              <select
                value={formData.furnished}
                onChange={(e) => setFormData({ ...formData, furnished: e.target.value as Renting['furnished'] })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Furnished">Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <select
                value={formData.availabilityStatus}
                onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value as Renting['availabilityStatus'] })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Available">Available</option>
                <option value="Rented">Rented</option>
                <option value="Under Negotiation">Under Negotiation</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Reserved">Reserved</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="e.g., 03001234567"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>


            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities (comma separated)</label>
              <input
                type="text"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                placeholder="e.g., Parking, Lift, Security"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lease Duration</label>
              <div className="flex space-x-2">
                <select
                  value={formData.leaseType}
                  onChange={(e) => setFormData({ ...formData, leaseType: e.target.value as Renting['leaseDuration']['type'] })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Half-Yearly">Half-Yearly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Custom">Custom</option>
                </select>
                <input
                  type="number"
                  value={formData.leaseValue}
                  onChange={(e) => setFormData({ ...formData, leaseValue: Number(e.target.value) })}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {formData.leaseType === 'Custom' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Period</label>
                <input
                  type="text"
                  value={formData.leaseCustomPeriod}
                  onChange={(e) => setFormData({ ...formData, leaseCustomPeriod: e.target.value })}
                  placeholder="e.g., 18 Months"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Schedule</label>
              <select
                value={formData.paymentSchedule}
                onChange={(e) => setFormData({ ...formData, paymentSchedule: e.target.value as Renting['paymentSchedule'] })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Half-Yearly">Half-Yearly</option>
                <option value="Yearly">Yearly</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <FileUpload
            files={formData.images}
            onFilesChange={(files) => setFormData({ ...formData, images: files })}
            accept=".jpg,.jpeg,.png"
            label="Property Images"
          />

          <FileUpload
            files={formData.documents}
            onFilesChange={(files) => setFormData({ ...formData, documents: files })}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            label="Documents"
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
              {selected ? 'Update' : 'Add'} Rent
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RentingModule;
