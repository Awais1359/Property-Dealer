import React, { useState } from 'react';
import { Plus, Clock, CheckCircle, Calendar, Phone, DollarSign } from 'lucide-react';
import Modal from './common/Modal';
import { Reminder, Property, Client, Deal } from '../types';
import { generateId, formatDate } from '../utils/storage';

interface RemindersModuleProps {
  reminders: Reminder[];
  properties: Property[];
  clients: Client[];
  deals: Deal[];
  onAdd: (reminder: Reminder) => void;
  onUpdate: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
}

const RemindersModule: React.FC<RemindersModuleProps> = ({
  reminders,
  properties,
  clients,
  deals,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [filterType, setFilterType] = useState('All');
  const [filterCompleted, setFilterCompleted] = useState('All');

  const [formData, setFormData] = useState({
    type: 'Follow-up' as Reminder['type'],
    title: '',
    description: '',
    dueDate: '',
    relatedType: 'Property' as Reminder['relatedTo']['type'],
    relatedId: ''
  });

  const today = new Date();
  const filteredReminders = reminders.filter(reminder => {
    const matchesType = filterType === 'All' || reminder.type === filterType;
    const matchesCompleted = filterCompleted === 'All' || 
      (filterCompleted === 'Completed' ? reminder.completed : !reminder.completed);
    
    return matchesType && matchesCompleted;
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const upcomingReminders = filteredReminders.filter(r => 
    !r.completed && new Date(r.dueDate) >= today
  );
  
  const overdueReminders = filteredReminders.filter(r => 
    !r.completed && new Date(r.dueDate) < today
  );

  const completedReminders = filteredReminders.filter(r => r.completed);

  const openModal = (reminder?: Reminder) => {
    if (reminder) {
      setSelectedReminder(reminder);
      setFormData({
        type: reminder.type,
        title: reminder.title,
        description: reminder.description,
        dueDate: new Date(reminder.dueDate).toISOString().split('T')[0],
        relatedType: reminder.relatedTo.type,
        relatedId: reminder.relatedTo.id
      });
    } else {
      setSelectedReminder(null);
      setFormData({
        type: 'Follow-up',
        title: '',
        description: '',
        dueDate: '',
        relatedType: 'Property',
        relatedId: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const reminderData: Reminder = {
      id: selectedReminder?.id || generateId(),
      type: formData.type,
      title: formData.title,
      description: formData.description,
      dueDate: new Date(formData.dueDate),
      completed: selectedReminder?.completed || false,
      relatedTo: {
        type: formData.relatedType,
        id: formData.relatedId
      },
      createdAt: selectedReminder?.createdAt || new Date()
    };

    if (selectedReminder) {
      onUpdate(reminderData);
    } else {
      onAdd(reminderData);
    }

    setIsModalOpen(false);
  };

  const toggleReminder = (reminder: Reminder) => {
    onUpdate({
      ...reminder,
      completed: !reminder.completed
    });
  };

  const getRelatedItem = (reminder: Reminder) => {
    switch (reminder.relatedTo.type) {
      case 'Property':
        return properties.find(p => p.id === reminder.relatedTo.id);
      case 'Client':
        return clients.find(c => c.id === reminder.relatedTo.id);
      case 'Deal':
        return deals.find(d => d.id === reminder.relatedTo.id);
      default:
        return null;
    }
  };

  const getTypeIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'Payment':
        return <DollarSign className="w-5 h-5" />;
      case 'Call':
        return <Phone className="w-5 h-5" />;
      case 'Follow-up':
        return <Clock className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: Reminder['type']) => {
    switch (type) {
      case 'Payment':
        return 'bg-green-100 text-green-800';
      case 'Call':
        return 'bg-blue-100 text-blue-800';
      case 'Follow-up':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const ReminderCard: React.FC<{ reminder: Reminder }> = ({ reminder }) => {
    const relatedItem = getRelatedItem(reminder);
    const isOverdue = new Date(reminder.dueDate) < today && !reminder.completed;
    
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${getTypeColor(reminder.type)}`}>
              {getTypeIcon(reminder.type)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{reminder.title}</h3>
              <p className="text-sm text-gray-500">
                {reminder.relatedTo.type}: {relatedItem ? 
                  (reminder.relatedTo.type === 'Property' ? (relatedItem as Property).name :
                   reminder.relatedTo.type === 'Client' ? (relatedItem as Client).name :
                   properties.find(p => p.id === (relatedItem as Deal).propertyId)?.name) 
                  : 'Unknown'
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleReminder(reminder)}
            className={`p-2 rounded-full ${
              reminder.completed 
                ? 'text-green-600 bg-green-100' 
                : 'text-gray-400 hover:text-green-600 hover:bg-green-100'
            } transition-colors`}
          >
            <CheckCircle className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-3">{reminder.description}</p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className={`${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
              {formatDate(reminder.dueDate)}
              {isOverdue && ' (Overdue)'}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => openModal(reminder)}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(reminder.id)}
              className="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reminders & Notes</h2>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Types</option>
            <option value="Payment">Payment</option>
            <option value="Call">Call</option>
            <option value="Follow-up">Follow-up</option>
          </select>

          <select
            value={filterCompleted}
            onChange={(e) => setFilterCompleted(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Overdue Reminders */}
      {overdueReminders.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-red-600 mb-4">
            Overdue ({overdueReminders.length})
          </h3>
          <div className="space-y-4">
            {overdueReminders.map(reminder => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Upcoming ({upcomingReminders.length})
          </h3>
          <div className="space-y-4">
            {upcomingReminders.map(reminder => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Completed ({completedReminders.length})
          </h3>
          <div className="space-y-4">
            {completedReminders.map(reminder => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </div>
      )}

      {filteredReminders.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No reminders found</h3>
          <p className="text-gray-500">Create your first reminder to get started</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedReminder ? 'Edit Reminder' : 'Add New Reminder'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Reminder['type'] })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Payment">Payment</option>
                <option value="Call">Call</option>
                <option value="Follow-up">Follow-up</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Follow up with client about offer"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Additional details about this reminder..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Related To</label>
              <select
                value={formData.relatedType}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    relatedType: e.target.value as Reminder['relatedTo']['type'],
                    relatedId: ''
                  });
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Property">Property</option>
                <option value="Client">Client</option>
                <option value="Deal">Deal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select {formData.relatedType}
              </label>
              <select
                required
                value={formData.relatedId}
                onChange={(e) => setFormData({ ...formData, relatedId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select {formData.relatedType}</option>
                {formData.relatedType === 'Property' && properties.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.propertyId} - {item.name}
                  </option>
                ))}
                {formData.relatedType === 'Client' && clients.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {item.mobile}
                  </option>
                ))}
                {formData.relatedType === 'Deal' && deals.map(item => {
                  const property = properties.find(p => p.id === item.propertyId);
                  return (
                    <option key={item.id} value={item.id}>
                      {property?.name} - Deal
                    </option>
                  );
                })}
              </select>
            </div>
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
              {selectedReminder ? 'Update' : 'Add'} Reminder
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RemindersModule;