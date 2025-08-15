import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, MapPin, Home, MessageSquare } from 'lucide-react';
import Modal from './common/Modal';
import FileUpload from './common/FileUpload';
import { Property } from '../types';
import { generateId, generatePropertyId, formatCurrency } from '../utils/storage';

interface PropertyModuleProps {
  properties: Property[];
  onAdd: (property: Property) => void;
  onUpdate: (property: Property) => void;
  onDelete: (id: string) => void;
  useLocalStorage?: boolean;
}

const PropertyModule: React.FC<PropertyModuleProps> = ({
  properties,
  onAdd,
  onUpdate,
  onDelete,
  useLocalStorage = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    city: '',
    area: '',
    street: '',
    type: 'Plot' as Property['type'],
    sizeValue: 0,
    sizeUnit: 'Marla' as Property['size']['unit'],
    price: 0,
    status: 'Available' as Property['status'],
    notes: '',
    remarks: {
      type: 'Sold' as 'Sold' | 'On Rent' | 'Other',
      customText: ''
    },
    images: [] as string[],
    documents: [] as string[]
  });

  const [remarksData, setRemarksData] = useState({
    type: 'Sold' as 'Sold' | 'On Rent' | 'Other',
    customText: ''
  });

  const filteredProperties = properties.filter(property => {
    try {
    const matchesSearch = 
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.propertyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.area.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'All' || property.type === filterType;
    const matchesStatus = filterStatus === 'All' || property.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
    } catch (error) {
      console.error('Error filtering property:', property, error);
      return false;
    }
  });

  const openModal = (property?: Property) => {
    if (property) {
      setSelectedProperty(property);
      setFormData({
        name: property.name,
        phoneNumber: property.phoneNumber || '',
        city: property.location.city,
        area: property.location.area,
        street: property.location.street,
        type: property.type,
        sizeValue: property.size.value,
        sizeUnit: property.size.unit,
        price: property.price,
        status: property.status,
        notes: property.notes,
        remarks: property.remarks ? { type: property.remarks.type, customText: property.remarks.customText || '' } : { 
          type: property.status === 'Sold' ? 'Sold' : 
                property.status === 'Rented' ? 'On Rent' : 'Other', 
          customText: '' 
        },
        images: property.images,
        documents: property.documents
      });
    } else {
      setSelectedProperty(null);
      setFormData({
        name: '',
        phoneNumber: '',
        city: '',
        area: '',
        street: '',
        type: 'Plot',
        sizeValue: 0,
        sizeUnit: 'Marla',
        price: 0,
        status: 'Available',
        notes: '',
        remarks: { type: 'Sold', customText: '' },
        images: [],
        documents: []
      });
    }
    setIsModalOpen(true);
  };

  const openRemarksModal = (property: Property) => {
    setSelectedProperty(property);
    
    // Map status to remarks when opening modal
    let remarksType: 'Sold' | 'On Rent' | 'Other' = 'Sold';
    if (property.status === 'Sold') {
      remarksType = 'Sold';
    } else if (property.status === 'Rented') {
      remarksType = 'On Rent';
    } else if (property.status === 'Available' || property.status === 'On Hold') {
      remarksType = 'Other';
    }
    
    setRemarksData(property.remarks ? { 
      type: property.remarks.type, 
      customText: property.remarks.customText || '' 
    } : { 
      type: remarksType, 
      customText: '' 
    });
    setIsRemarksModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
    const propertyData: Property = {
      id: selectedProperty?.id || generateId(),
      propertyId: selectedProperty?.propertyId || generatePropertyId(properties.map(p => p.propertyId)),
      name: formData.name,
        phoneNumber: formData.phoneNumber,
      location: {
        city: formData.city,
        area: formData.area,
        street: formData.street
      },
      type: formData.type,
      size: {
        value: formData.sizeValue,
        unit: formData.sizeUnit
      },
      price: formData.price,
      status: formData.status,
      notes: formData.notes,
        remarks: formData.remarks,
      images: formData.images,
      documents: formData.documents,
      createdAt: selectedProperty?.createdAt || new Date(),
      updatedAt: new Date()
    };

      console.log('Submitting property data:', propertyData);

    if (selectedProperty) {
      onUpdate(propertyData);
    } else {
      onAdd(propertyData);
    }

    setIsModalOpen(false);
    } catch (error) {
      console.error('Error submitting property:', error);
      alert('Error saving property. Please try again.');
    }
  };

  const handleRemarksSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProperty) {
      try {
        // Map remarks to status
        let newStatus: Property['status'] = 'Available';
        if (remarksData.type === 'Sold') {
          newStatus = 'Sold';
        } else if (remarksData.type === 'On Rent') {
          newStatus = 'Rented';
        } else if (remarksData.type === 'Other') {
          newStatus = 'Available'; // Default to Available for Other
        }
        
        // Ensure customText is properly set for "Other" type
        const finalRemarks = {
          type: remarksData.type,
          customText: remarksData.type === 'Other' ? (remarksData.customText || '') : undefined
        };
        
        const updatedProperty: Property = {
          ...selectedProperty,
          status: newStatus,
          remarks: finalRemarks,
          updatedAt: new Date()
        };
        
        console.log('Updating property with remarks:', updatedProperty);
        onUpdate(updatedProperty);
      } catch (error) {
        console.error('Error updating property remarks:', error);
        alert('Error updating remarks. Please try again.');
      }
    }
    
    setIsRemarksModalOpen(false);
    setSelectedProperty(null); // Clear selected property after closing modal
  };

  const viewProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsViewModalOpen(true);
  };

  const getStatusColor = (status: Property['status']) => {
    const colors = {
      Available: 'bg-green-100 text-green-800',
      Sold: 'bg-red-100 text-red-800',
      Rented: 'bg-blue-100 text-blue-800',
      'On Hold': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status];
  };

  // Debug effect to track properties changes
  useEffect(() => {
    console.log('Properties changed:', properties);
    console.log('Filtered properties:', filteredProperties);
  }, [properties, filteredProperties]);

  const getRemarksDisplay = (property: Property) => {
    if (!property.remarks) {
      // If no remarks, show status-based remarks
      if (property.status === 'Sold') return 'Sold';
      if (property.status === 'Rented') return 'On Rent';
      if (property.status === 'Available') return 'Available';
      if (property.status === 'On Hold') return 'On Hold';
      return 'No remarks';
    }
    
    if (property.remarks.type === 'Other' && property.remarks.customText) {
      return property.remarks.customText;
    }
    
    return property.remarks.type;
  };

  // Error boundary for the component
  if (!properties || !Array.isArray(properties)) {
    console.error('Properties is not an array:', properties);
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Properties</h3>
          <p className="text-red-600 text-sm mt-1">Please refresh the page to try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Property Management</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Using {useLocalStorage ? 'localStorage' : 'IndexedDB'} for data storage
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add New Property</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            <option value="All">All Types</option>
            <option value="Plot">Plot</option>
            <option value="House">House</option>
            <option value="Shop">Shop</option>
            <option value="Flat">Flat</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Sold">Sold</option>
            <option value="Rented">Rented</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Property ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Type & Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Remarks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProperties && filteredProperties.length > 0 ? filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {property.propertyId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {property.phoneNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      {property.location.area}, {property.location.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Home className="w-4 h-4 mr-1 text-gray-400" />
                      {property.type} • {property.size.value} {property.size.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatCurrency(property.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(property.status)}`}>
                      {property.status}
                    </span>
                    {property.remarks && property.remarks.type === 'Other' && (
                      <div className="text-xs text-gray-500 mt-1">
                        Custom remarks set
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <span>{getRemarksDisplay(property)}</span>
                      {property.remarks && (
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          Custom
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => viewProperty(property)}
                        className="text-blue-600 hover:text-blue-900 p-1 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal(property)}
                        className="text-green-600 hover:text-green-900 p-1 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openRemarksModal(property)}
                        className="text-purple-600 hover:text-purple-900 p-1 transition-colors"
                        title="Remarks"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(property.id)}
                        className="text-red-600 hover:text-red-900 p-1 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No properties found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4 max-h-[70vh] overflow-y-auto">
        {filteredProperties && filteredProperties.length > 0 ? filteredProperties.map((property) => (
          <div key={property.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{property.name}</h3>
                  <p className="text-blue-600 font-medium text-sm">{property.propertyId}</p>
                </div>
                <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(property.status)}`}>
                  {property.status}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Phone & Location */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{property.phoneNumber || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900">{property.location.area}, {property.location.city}</p>
                  </div>
                </div>
              </div>

              {/* Type & Size */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Home className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type & Size</p>
                  <p className="text-sm font-medium text-gray-900">{property.type} • {property.size.value} {property.size.unit}</p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(property.price)}</p>
                </div>
              </div>

              {/* Remarks */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Remarks</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{getRemarksDisplay(property)}</span>
                    {property.remarks && (
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        Custom
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => viewProperty(property)}
                    className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => openModal(property)}
                    className="flex items-center space-x-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openRemarksModal(property)}
                    className="flex items-center space-x-1 bg-purple-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Remarks</span>
                  </button>
                <button
                  onClick={() => onDelete(property.id)}
                    className="flex items-center space-x-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                </button>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProperty ? 'Edit Property' : 'Add New Property'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+92 XXX XXXXXXX"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Property['type'] })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Plot">Plot</option>
                <option value="House">House</option>
                <option value="Shop">Shop</option>
                <option value="Flat">Flat</option>
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
              <input
                type="text"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={formData.sizeUnit}
                  onChange={(e) => setFormData({ ...formData, sizeUnit: e.target.value as Property['size']['unit'] })}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Marla">Marla</option>
                  <option value="Kanal">Kanal</option>
                  <option value="Sqft">Sqft</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (PKR)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => {
                  const newStatus = e.target.value as Property['status'];
                  let newRemarksType: 'Sold' | 'On Rent' | 'Other' = 'Sold';
                  
                  // Map status to remarks
                  if (newStatus === 'Sold') {
                    newRemarksType = 'Sold';
                  } else if (newStatus === 'Rented') {
                    newRemarksType = 'On Rent';
                  } else if (newStatus === 'Available' || newStatus === 'On Hold') {
                    newRemarksType = 'Other';
                  }
                  
                  setFormData({ 
                    ...formData, 
                    status: newStatus,
                    remarks: {
                      type: newRemarksType,
                      customText: newRemarksType === 'Other' ? (formData.remarks.customText || '') : ''
                    }
                  });
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Available">Available</option>
                <option value="Sold">Sold</option>
                <option value="Rented">Rented</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
            label="Property Documents"
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
              {selectedProperty ? 'Update' : 'Add'} Property
            </button>
          </div>
        </form>
      </Modal>

      {/* Remarks Modal */}
      <Modal
        isOpen={isRemarksModalOpen}
        onClose={() => setIsRemarksModalOpen(false)}
        title="Update Remarks & Status"
        size="md"
      >
        <form onSubmit={handleRemarksSubmit} className="space-y-4">
          {selectedProperty && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-600">
                <strong>Current Status:</strong> 
                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedProperty.status)}`}>
                  {selectedProperty.status}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Changing remarks will also update the property status
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Remarks Type</label>
            <select
              value={remarksData.type}
              onChange={(e) => {
                const newRemarksType = e.target.value as 'Sold' | 'On Rent' | 'Other';
                let newStatus: Property['status'] = 'Available';
                
                // Map remarks to status
                if (newRemarksType === 'Sold') {
                  newStatus = 'Sold';
                } else if (newRemarksType === 'On Rent') {
                  newStatus = 'Rented';
                } else if (newRemarksType === 'Other') {
                  newStatus = 'Available'; // Default to Available for Other
                }
                
                setRemarksData({ 
                  ...remarksData, 
                  type: newRemarksType,
                  customText: newRemarksType === 'Other' ? (remarksData.customText || '') : ''
                });
              }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Sold">Sold</option>
              <option value="On Rent">On Rent</option>
              <option value="Other">Other</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              This will set status to: 
              <span className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                remarksData.type === 'Sold' ? 'bg-red-100 text-red-800' :
                remarksData.type === 'On Rent' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {
                  remarksData.type === 'Sold' ? 'Sold' :
                  remarksData.type === 'On Rent' ? 'Rented' :
                  'Available'
                }
              </span>
            </p>
          </div>

          {remarksData.type === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Remarks</label>
              <textarea
                value={remarksData.customText || ''}
                onChange={(e) => setRemarksData({ ...remarksData, customText: e.target.value })}
                rows={3}
                placeholder="Enter your custom remarks..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsRemarksModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Remarks
            </button>
          </div>
        </form>
      </Modal>

      {/* View Property Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Property Details"
        size="lg"
      >
        {selectedProperty && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Property ID:</span>
                    <p className="text-gray-800">{selectedProperty.propertyId}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Customer Name:</span>
                    <p className="text-gray-800">{selectedProperty.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Phone Number:</span>
                    <p className="text-gray-800">{selectedProperty.phoneNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Type:</span>
                    <p className="text-gray-800">{selectedProperty.type}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Size:</span>
                    <p className="text-gray-800">{selectedProperty.size.value} {selectedProperty.size.unit}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Price:</span>
                    <p className="text-lg font-semibold text-gray-800">{formatCurrency(selectedProperty.price)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProperty.status)}`}>
                      {selectedProperty.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Remarks:</span>
                    <p className="text-gray-800">{getRemarksDisplay(selectedProperty)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Location</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">City:</span>
                    <p className="text-gray-800">{selectedProperty.location.city}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Area:</span>
                    <p className="text-gray-800">{selectedProperty.location.area}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Street:</span>
                    <p className="text-gray-800">{selectedProperty.location.street || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {selectedProperty.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedProperty.notes}</p>
              </div>
            )}

            {selectedProperty.images.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Images ({selectedProperty.images.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedProperty.images.map((image, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-gray-500">Image {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedProperty.documents.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Documents ({selectedProperty.documents.length})</h3>
                <div className="space-y-2">
                  {selectedProperty.documents.map((doc, index) => (
                    <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Document {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PropertyModule;