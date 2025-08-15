import { useState, useEffect } from 'react';
import { database } from '../utils/database';
import { localStorageStorage } from '../utils/storage';
import { Property, Client, Deal, Reminder, Renting } from '../types';

export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [useLocalStorage, setUseLocalStorage] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [rentings, setRentings] = useState<Renting[]>([]);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        await database.init();
        setIsInitialized(true);
        setUseLocalStorage(false);
        await loadData();
      } catch (error) {
        console.error('Failed to initialize IndexedDB, falling back to localStorage:', error);
        setUseLocalStorage(true);
        setIsInitialized(true);
        await loadDataFromLocalStorage();
      }
    };

    initDatabase();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading data from IndexedDB...');
      const [propertiesData, clientsData, dealsData, remindersData, rentingsData] = await Promise.all([
        database.getAll<Property>('properties'),
        database.getAll<Client>('clients'),
        database.getAll<Deal>('deals'),
        database.getAll<Reminder>('reminders'),
        database.getAll<Renting>('rentings')
      ]);

      console.log('Loaded properties from IndexedDB:', propertiesData);
      setProperties(propertiesData);
      setClients(clientsData);
      setDeals(dealsData);
      setReminders(remindersData);
      setRentings(rentingsData);
    } catch (error) {
      console.error('Failed to load data from IndexedDB:', error);
      // Fallback to localStorage
      setUseLocalStorage(true);
      await loadDataFromLocalStorage();
    }
  };

  const loadDataFromLocalStorage = async () => {
    try {
      console.log('Loading data from localStorage...');
      const propertiesData = localStorageStorage.getProperties();
      const clientsData = localStorageStorage.getClients();
      const dealsData = localStorageStorage.getDeals();
      const remindersData = localStorageStorage.getReminders();
      const rentingsData = localStorageStorage.getRentings();

      console.log('Loaded properties from localStorage:', propertiesData);
      setProperties(propertiesData);
      setClients(clientsData);
      setDeals(dealsData);
      setReminders(remindersData);
      setRentings(rentingsData);
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
  };

  const addProperty = async (property: Property) => {
    try {
      if (useLocalStorage) {
        localStorageStorage.addProperty(property);
        setProperties(prev => [...prev, property]);
      } else {
        await database.add('properties', property);
        setProperties(prev => [...prev, property]);
      }
    } catch (error) {
      console.error('Failed to add property:', error);
      // Fallback to localStorage
      setUseLocalStorage(true);
      localStorageStorage.addProperty(property);
      setProperties(prev => [...prev, property]);
    }
  };

  const updateProperty = async (property: Property) => {
    try {
      console.log('Updating property:', property);
      if (useLocalStorage) {
        localStorageStorage.updateProperty(property);
        console.log('Property updated in localStorage, updating state...');
        setProperties(prev => {
          const updated = prev.map(p => p.id === property.id ? property : p);
          console.log('Updated properties state:', updated);
          return updated;
        });
      } else {
        await database.update('properties', property);
        console.log('Property updated in IndexedDB, updating state...');
        setProperties(prev => {
          const updated = prev.map(p => p.id === property.id ? property : p);
          console.log('Updated properties state:', updated);
          return updated;
        });
      }
    } catch (error) {
      console.error('Failed to update property:', error);
      // Fallback to localStorage
      setUseLocalStorage(true);
      localStorageStorage.updateProperty(property);
      setProperties(prev => prev.map(p => p.id === property.id ? property : p));
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      if (useLocalStorage) {
        localStorageStorage.deleteProperty(id);
        setProperties(prev => prev.filter(p => p.id !== id));
      } else {
        await database.delete('properties', id);
        setProperties(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete property:', error);
      // Fallback to localStorage
      setUseLocalStorage(true);
      localStorageStorage.deleteProperty(id);
      setProperties(prev => prev.filter(p => p.id !== id));
    }
  };

  const addClient = async (client: Client) => {
    try {
      if (useLocalStorage) {
        localStorageStorage.addClient(client);
        setClients(prev => [...prev, client]);
      } else {
        await database.add('clients', client);
        setClients(prev => [...prev, client]);
      }
    } catch (error) {
      console.error('Failed to add client:', error);
      // Fallback to localStorage
      setUseLocalStorage(true);
      localStorageStorage.addClient(client);
      setClients(prev => [...prev, client]);
    }
  };

  const updateClient = async (client: Client) => {
    try {
      if (useLocalStorage) {
        localStorageStorage.updateClient(client);
        setClients(prev => prev.map(c => c.id === client.id ? client : c));
      } else {
        await database.update('clients', client);
        setClients(prev => prev.map(c => c.id === client.id ? client : c));
      }
    } catch (error) {
      console.error('Failed to update client:', error);
      // Fallback to localStorage
      setUseLocalStorage(true);
      localStorageStorage.updateClient(client);
      setClients(prev => prev.map(c => c.id === client.id ? client : c));
    }
  };

  const deleteClient = async (id: string) => {
    try {
      if (useLocalStorage) {
        localStorageStorage.deleteClient(id);
        setClients(prev => prev.filter(c => c.id !== id));
      } else {
        await database.delete('clients', id);
        setClients(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete client:', error);
      // Fallback to localStorage
      setUseLocalStorage(true);
      localStorageStorage.deleteClient(id);
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  const addDeal = async (deal: Deal) => {
    try {
      if (useLocalStorage) {
        localStorageStorage.addDeal(deal);
        setDeals(prev => [...prev, deal]);
      } else {
        await database.add('deals', deal);
        setDeals(prev => [...prev, deal]);
      }
    } catch (error) {
      console.error('Failed to add deal:', error);
      // Fallback to localStorage
      setUseLocalStorage(true);
      localStorageStorage.addDeal(deal);
      setDeals(prev => [...prev, deal]);
    }
  };

  const updateDeal = async (deal: Deal) => {
    try {
      if (useLocalStorage) {
        localStorageStorage.updateDeal(deal);
        setDeals(prev => prev.map(d => d.id === deal.id ? deal : d));
      } else {
        await database.update('deals', deal);
        setDeals(prev => prev.map(d => d.id === deal.id ? deal : d));
      }
    } catch (error) {
      console.error('Failed to update deal:', error);
      // Fallback to localStorage
      setUseLocalStorage(true);
      localStorageStorage.updateDeal(deal);
      setDeals(prev => prev.map(d => d.id === deal.id ? deal : d));
    }
  };

  const deleteDeal = async (id: string) => {
    try {
      if (useLocalStorage) {
        localStorageStorage.deleteDeal(id);
        setDeals(prev => prev.filter(d => d.id !== id));
      } else {
        await database.delete('deals', id);
        setDeals(prev => prev.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete deal:', error);
      // Fallback to localStorage
      setUseLocalStorage(true);
      localStorageStorage.deleteDeal(id);
      setDeals(prev => prev.filter(d => d.id !== id));
    }
  };

  const addReminder = async (reminder: Reminder) => {
    try {
      if (useLocalStorage) {
        localStorageStorage.addReminder(reminder);
        setReminders(prev => [...prev, reminder]);
      } else {
        await database.add('reminders', reminder);
        setReminders(prev => [...prev, reminder]);
      }
    } catch (error) {
      console.error('Failed to add reminder:', error);
      // Fallback to localStorage
      setUseLocalStorage(true);
      localStorageStorage.addReminder(reminder);
      setReminders(prev => [...prev, reminder]);
    }
  };

  const updateReminder = async (reminder: Reminder) => {
    try {
      if (useLocalStorage) {
        localStorageStorage.updateReminder(reminder);
        setReminders(prev => prev.map(r => r.id === reminder.id ? reminder : r));
      } else {
        await database.update('reminders', reminder);
        setReminders(prev => prev.map(r => r.id === reminder.id ? reminder : r));
      }
    } catch (error) {
      console.error('Failed to update reminder:', error);
      // Fallback to localStorage
      setUseLocalStorage(true);
      localStorageStorage.updateReminder(reminder);
      setReminders(prev => prev.map(r => r.id === reminder.id ? reminder : r));
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      if (useLocalStorage) {
        localStorageStorage.deleteReminder(id);
        setReminders(prev => prev.filter(r => r.id !== id));
      } else {
        await database.delete('reminders', id);
        setReminders(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete reminder:', error);
      // Fallback to localStorage
      setUseLocalStorage(true);
      localStorageStorage.deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
    }
  };

  const addRenting = async (renting: Renting) => {
    try {
      if (useLocalStorage) {
        localStorageStorage.addRenting(renting);
        setRentings(prev => [...prev, renting]);
      } else {
        await database.add('rentings', renting);
        setRentings(prev => [...prev, renting]);
      }
    } catch (error) {
      console.error('Failed to add renting:', error);
      setUseLocalStorage(true);
      localStorageStorage.addRenting(renting);
      setRentings(prev => [...prev, renting]);
    }
  };

  const updateRenting = async (renting: Renting) => {
    try {
      if (useLocalStorage) {
        localStorageStorage.updateRenting(renting);
        setRentings(prev => prev.map(r => r.id === renting.id ? renting : r));
      } else {
        await database.update('rentings', renting);
        setRentings(prev => prev.map(r => r.id === renting.id ? renting : r));
      }
    } catch (error) {
      console.error('Failed to update renting:', error);
      setUseLocalStorage(true);
      localStorageStorage.updateRenting(renting);
      setRentings(prev => prev.map(r => r.id === renting.id ? renting : r));
    }
  };

  const deleteRenting = async (id: string) => {
    try {
      if (useLocalStorage) {
        localStorageStorage.deleteRenting(id);
        setRentings(prev => prev.filter(r => r.id !== id));
      } else {
        await database.delete('rentings', id);
        setRentings(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete renting:', error);
      setUseLocalStorage(true);
      localStorageStorage.deleteRenting(id);
      setRentings(prev => prev.filter(r => r.id !== id));
    }
  };

  return {
    isInitialized,
    useLocalStorage,
    properties,
    clients,
    deals,
    reminders,
    rentings,
    addProperty,
    updateProperty,
    deleteProperty,
    addClient,
    updateClient,
    deleteClient,
    addDeal,
    updateDeal,
    deleteDeal,
    addReminder,
    updateReminder,
    deleteReminder,
    addRenting,
    updateRenting,
    deleteRenting,
    loadData: useLocalStorage ? loadDataFromLocalStorage : loadData
  };
};