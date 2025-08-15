import { Property, Client, Deal, Reminder, Renting } from '../types';

export const generatePropertyId = (existingIds: string[]): string => {
  const maxId = existingIds
    .map(id => parseInt(id.split('-')[1]))
    .reduce((max, current) => Math.max(max, current), 0);
  
  return `P-${String(maxId + 1).padStart(3, '0')}`;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const generateRentingId = (existingIds: string[]): string => {
  const maxId = existingIds
    .map(id => parseInt(id.split('-')[1]))
    .reduce((max, current) => Math.max(max, current), 0);
  return `R-${String(maxId + 1).padStart(3, '0')}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-PK').format(date);
};

// localStorage fallback functions
export const localStorageStorage = {
  // Properties
  getProperties: (): Property[] => {
    try {
      const data = localStorage.getItem('properties');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading properties from localStorage:', error);
      return [];
    }
  },

  saveProperties: (properties: Property[]): void => {
    try {
      localStorage.setItem('properties', JSON.stringify(properties));
    } catch (error) {
      console.error('Error saving properties to localStorage:', error);
    }
  },

  addProperty: (property: Property): void => {
    try {
      const properties = localStorageStorage.getProperties();
      properties.push(property);
      localStorageStorage.saveProperties(properties);
    } catch (error) {
      console.error('Error adding property to localStorage:', error);
    }
  },

  updateProperty: (property: Property): void => {
    try {
      const properties = localStorageStorage.getProperties();
      const index = properties.findIndex(p => p.id === property.id);
      if (index !== -1) {
        properties[index] = property;
        localStorageStorage.saveProperties(properties);
      }
    } catch (error) {
      console.error('Error updating property in localStorage:', error);
    }
  },

  deleteProperty: (id: string): void => {
    try {
      const properties = localStorageStorage.getProperties();
      const filtered = properties.filter(p => p.id !== id);
      localStorageStorage.saveProperties(filtered);
    } catch (error) {
      console.error('Error deleting property from localStorage:', error);
    }
  },

  // Clients
  getClients: (): Client[] => {
    try {
      const data = localStorage.getItem('clients');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading clients from localStorage:', error);
      return [];
    }
  },

  saveClients: (clients: Client[]): void => {
    try {
      localStorage.setItem('clients', JSON.stringify(clients));
    } catch (error) {
      console.error('Error saving clients to localStorage:', error);
    }
  },

  addClient: (client: Client): void => {
    try {
      const clients = localStorageStorage.getClients();
      clients.push(client);
      localStorageStorage.saveClients(clients);
    } catch (error) {
      console.error('Error adding client to localStorage:', error);
    }
  },

  updateClient: (client: Client): void => {
    try {
      const clients = localStorageStorage.getClients();
      const index = clients.findIndex(c => c.id === client.id);
      if (index !== -1) {
        clients[index] = client;
        localStorageStorage.saveClients(clients);
      }
    } catch (error) {
      console.error('Error updating client in localStorage:', error);
    }
  },

  deleteClient: (id: string): void => {
    try {
      const clients = localStorageStorage.getClients();
      const filtered = clients.filter(c => c.id !== id);
      localStorageStorage.saveClients(filtered);
    } catch (error) {
      console.error('Error deleting client from localStorage:', error);
    }
  },

  // Deals
  getDeals: (): Deal[] => {
    try {
      const data = localStorage.getItem('deals');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading deals from localStorage:', error);
      return [];
    }
  },

  saveDeals: (deals: Deal[]): void => {
    try {
      localStorage.setItem('deals', JSON.stringify(deals));
    } catch (error) {
      console.error('Error saving deals to localStorage:', error);
    }
  },

  addDeal: (deal: Deal): void => {
    try {
      const deals = localStorageStorage.getDeals();
      deals.push(deal);
      localStorageStorage.saveDeals(deals);
    } catch (error) {
      console.error('Error adding deal to localStorage:', error);
    }
  },

  updateDeal: (deal: Deal): void => {
    try {
      const deals = localStorageStorage.getDeals();
      const index = deals.findIndex(d => d.id === deal.id);
      if (index !== -1) {
        deals[index] = deal;
        localStorageStorage.saveDeals(deals);
      }
    } catch (error) {
      console.error('Error updating deal in localStorage:', error);
    }
  },

  deleteDeal: (id: string): void => {
    try {
      const deals = localStorageStorage.getDeals();
      const filtered = deals.filter(d => d.id !== id);
      localStorageStorage.saveDeals(filtered);
    } catch (error) {
      console.error('Error deleting deal from localStorage:', error);
    }
  },

  // Reminders
  getReminders: (): Reminder[] => {
    try {
      const data = localStorage.getItem('reminders');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading reminders from localStorage:', error);
      return [];
    }
  },

  saveReminders: (reminders: Reminder[]): void => {
    try {
      localStorage.setItem('reminders', JSON.stringify(reminders));
    } catch (error) {
      console.error('Error saving reminders to localStorage:', error);
    }
  },

  addReminder: (reminder: Reminder): void => {
    try {
      const reminders = localStorageStorage.getReminders();
      reminders.push(reminder);
      localStorageStorage.saveReminders(reminders);
    } catch (error) {
      console.error('Error adding reminder to localStorage:', error);
    }
  },

  updateReminder: (reminder: Reminder): void => {
    try {
      const reminders = localStorageStorage.getReminders();
      const index = reminders.findIndex(r => r.id === reminder.id);
      if (index !== -1) {
        reminders[index] = reminder;
        localStorageStorage.saveReminders(reminders);
      }
    } catch (error) {
      console.error('Error updating reminder in localStorage:', error);
    }
  },

  deleteReminder: (id: string): void => {
    try {
      const reminders = localStorageStorage.getReminders();
      const filtered = reminders.filter(r => r.id !== id);
      localStorageStorage.saveReminders(filtered);
    } catch (error) {
      console.error('Error deleting reminder from localStorage:', error);
    }
  },

  // Rentings
  getRentings: (): Renting[] => {
    try {
      const data = localStorage.getItem('rentings');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading rentings from localStorage:', error);
      return [];
    }
  },

  saveRentings: (rentings: Renting[]): void => {
    try {
      localStorage.setItem('rentings', JSON.stringify(rentings));
    } catch (error) {
      console.error('Error saving rentings to localStorage:', error);
    }
  },

  addRenting: (renting: Renting): void => {
    try {
      const rentings = localStorageStorage.getRentings();
      rentings.push(renting);
      localStorageStorage.saveRentings(rentings);
    } catch (error) {
      console.error('Error adding renting to localStorage:', error);
    }
  },

  updateRenting: (renting: Renting): void => {
    try {
      const rentings = localStorageStorage.getRentings();
      const index = rentings.findIndex(r => r.id === renting.id);
      if (index !== -1) {
        rentings[index] = renting;
        localStorageStorage.saveRentings(rentings);
      }
    } catch (error) {
      console.error('Error updating renting in localStorage:', error);
    }
  },

  deleteRenting: (id: string): void => {
    try {
      const rentings = localStorageStorage.getRentings();
      const filtered = rentings.filter(r => r.id !== id);
      localStorageStorage.saveRentings(filtered);
    } catch (error) {
      console.error('Error deleting renting from localStorage:', error);
    }
  }
};

export const exportToExcel = async (data: any, filename: string) => {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  csvRows.push(headers.join(','));
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value}"` : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};

export const validatePin = (pin: string): boolean => {
  const storedPin = localStorage.getItem('propertyDealerPin');
  return storedPin === pin;
};

export const setPin = (pin: string): void => {
  localStorage.setItem('propertyDealerPin', pin);
};

export const hasPin = (): boolean => {
  return localStorage.getItem('propertyDealerPin') !== null;
};