import { useState, useEffect } from 'react';
import { database } from '../utils/database';
import { localStorageStorage } from '../utils/storage';
import { firestoreManager } from '../utils/firestore';
import { ensureAnonymousAuth } from '../utils/firebase';
import { Property, Client, Deal, Reminder, Renting } from '../types';

// Force Firebase Firestore only (no localStorage/IndexedDB fallbacks)
const FIREBASE_ONLY = true;

export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [useLocalStorage, setUseLocalStorage] = useState(false);
  const [useFirestore, setUseFirestore] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [rentings, setRentings] = useState<Renting[]>([]);

  useEffect(() => {
    const initStack = async () => {
      // 1) Prefer Firestore (do not probe with a read that might be blocked by rules)
      setUseFirestore(true);
      try {
        await ensureAnonymousAuth();
        setIsInitialized(true);
        await loadDataFromFirestore();
        return;
      } catch (err) {
        console.warn('Failed to load from Firestore (may be due to rules). Will still attempt Firestore for writes. Falling back to IndexedDB for initial load.', err);
      }

      if (FIREBASE_ONLY) {
        // Do not attempt any local persistence. Initialize with empty arrays.
        setIsInitialized(true);
        setProperties([]);
        setClients([]);
        setDeals([]);
        setReminders([]);
        setRentings([]);
        return;
      }

      // 2) Try IndexedDB
      try {
        await database.init();
        setUseFirestore(false);
        setUseLocalStorage(false);
        setIsInitialized(true);
        await loadData();
        return;
      } catch (error) {
        console.error('Failed to initialize IndexedDB, falling back to localStorage:', error);
      }

      // 3) Fallback to localStorage
      setUseLocalStorage(true);
      setIsInitialized(true);
      await loadDataFromLocalStorage();
    };

    initStack();
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

  const loadDataFromFirestore = async () => {
    console.log('Loading data from Firestore...');
    const [propertiesData, clientsData, dealsData, remindersData, rentingsData] = await Promise.all([
      firestoreManager.getAll<Property>('properties'),
      firestoreManager.getAll<Client>('clients'),
      firestoreManager.getAll<Deal>('deals'),
      firestoreManager.getAll<Reminder>('reminders'),
      firestoreManager.getAll<Renting>('rentings')
    ]);

    setProperties(propertiesData);
    setClients(clientsData);
    setDeals(dealsData);
    setReminders(remindersData);
    setRentings(rentingsData);
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
      if (useFirestore) {
        await ensureAnonymousAuth();
        await firestoreManager.add('properties', property);
        setProperties(prev => [...prev, property]);
      } else if (useLocalStorage) {
        localStorageStorage.addProperty(property);
        setProperties(prev => [...prev, property]);
      } else {
        await database.add('properties', property);
        setProperties(prev => [...prev, property]);
      }
    } catch (error) {
      console.error('Failed to add property (Firestore):', error);
    }
  };

  const updateProperty = async (property: Property) => {
    try {
      console.log('Updating property:', property);
      if (useFirestore) {
        await ensureAnonymousAuth();
        await firestoreManager.update('properties', property);
        setProperties(prev => {
          const updated = prev.map(p => p.id === property.id ? property : p);
          console.log('Updated properties state:', updated);
          return updated;
        });
      } else if (useLocalStorage) {
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
      console.error('Failed to update property (Firestore):', error);
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      if (useFirestore) {
        await ensureAnonymousAuth();
        await firestoreManager.delete('properties', id);
        setProperties(prev => prev.filter(p => p.id !== id));
      } else if (useLocalStorage) {
        localStorageStorage.deleteProperty(id);
        setProperties(prev => prev.filter(p => p.id !== id));
      } else {
        await database.delete('properties', id);
        setProperties(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete property (Firestore):', error);
    }
  };

  const addClient = async (client: Client) => {
    try {
      if (useFirestore) {
        await ensureAnonymousAuth();
        await firestoreManager.add('clients', client);
        setClients(prev => [...prev, client]);
      } else if (useLocalStorage) {
        localStorageStorage.addClient(client);
        setClients(prev => [...prev, client]);
      } else {
        await database.add('clients', client);
        setClients(prev => [...prev, client]);
      }
    } catch (error) {
      console.error('Failed to add client (Firestore):', error);
    }
  };

  const updateClient = async (client: Client) => {
    try {
      if (useFirestore) {
        await ensureAnonymousAuth();
        await firestoreManager.update('clients', client);
        setClients(prev => prev.map(c => c.id === client.id ? client : c));
      } else if (useLocalStorage) {
        localStorageStorage.updateClient(client);
        setClients(prev => prev.map(c => c.id === client.id ? client : c));
      } else {
        await database.update('clients', client);
        setClients(prev => prev.map(c => c.id === client.id ? client : c));
      }
    } catch (error) {
      console.error('Failed to update client (Firestore):', error);
    }
  };

  const deleteClient = async (id: string) => {
    try {
      if (useFirestore) {
        await ensureAnonymousAuth();
        await firestoreManager.delete('clients', id);
        setClients(prev => prev.filter(c => c.id !== id));
      } else if (useLocalStorage) {
        localStorageStorage.deleteClient(id);
        setClients(prev => prev.filter(c => c.id !== id));
      } else {
        await database.delete('clients', id);
        setClients(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete client (Firestore):', error);
    }
  };

  const addDeal = async (deal: Deal) => {
    try {
      if (useFirestore) {
        await ensureAnonymousAuth();
        await firestoreManager.add('deals', deal);
        setDeals(prev => [...prev, deal]);
      } else if (useLocalStorage) {
        localStorageStorage.addDeal(deal);
        setDeals(prev => [...prev, deal]);
      } else {
        await database.add('deals', deal);
        setDeals(prev => [...prev, deal]);
      }
    } catch (error) {
      console.error('Failed to add deal (Firestore):', error);
    }
  };

  const updateDeal = async (deal: Deal) => {
    try {
      if (useFirestore) {
        await ensureAnonymousAuth();
        await firestoreManager.update('deals', deal);
        setDeals(prev => prev.map(d => d.id === deal.id ? deal : d));
      } else if (useLocalStorage) {
        localStorageStorage.updateDeal(deal);
        setDeals(prev => prev.map(d => d.id === deal.id ? deal : d));
      } else {
        await database.update('deals', deal);
        setDeals(prev => prev.map(d => d.id === deal.id ? deal : d));
      }
    } catch (error) {
      console.error('Failed to update deal (Firestore):', error);
    }
  };

  const deleteDeal = async (id: string) => {
    try {
      if (useFirestore) {
        await ensureAnonymousAuth();
        await firestoreManager.delete('deals', id);
        setDeals(prev => prev.filter(d => d.id !== id));
      } else if (useLocalStorage) {
        localStorageStorage.deleteDeal(id);
        setDeals(prev => prev.filter(d => d.id !== id));
      } else {
        await database.delete('deals', id);
        setDeals(prev => prev.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete deal (Firestore):', error);
    }
  };

  const addReminder = async (reminder: Reminder) => {
    try {
      if (useFirestore) {
        await ensureAnonymousAuth();
        await firestoreManager.add('reminders', reminder);
        setReminders(prev => [...prev, reminder]);
      } else if (useLocalStorage) {
        localStorageStorage.addReminder(reminder);
        setReminders(prev => [...prev, reminder]);
      } else {
        await database.add('reminders', reminder);
        setReminders(prev => [...prev, reminder]);
      }
    } catch (error) {
      console.error('Failed to add reminder (Firestore):', error);
    }
  };

  const updateReminder = async (reminder: Reminder) => {
    try {
      if (useFirestore) {
        await ensureAnonymousAuth();
        await firestoreManager.update('reminders', reminder);
        setReminders(prev => prev.map(r => r.id === reminder.id ? reminder : r));
      } else if (useLocalStorage) {
        localStorageStorage.updateReminder(reminder);
        setReminders(prev => prev.map(r => r.id === reminder.id ? reminder : r));
      } else {
        await database.update('reminders', reminder);
        setReminders(prev => prev.map(r => r.id === reminder.id ? reminder : r));
      }
    } catch (error) {
      console.error('Failed to update reminder (Firestore):', error);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      if (useFirestore) {
        await ensureAnonymousAuth();
        await firestoreManager.delete('reminders', id);
        setReminders(prev => prev.filter(r => r.id !== id));
      } else if (useLocalStorage) {
        localStorageStorage.deleteReminder(id);
        setReminders(prev => prev.filter(r => r.id !== id));
      } else {
        await database.delete('reminders', id);
        setReminders(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete reminder (Firestore):', error);
    }
  };

  const addRenting = async (renting: Renting) => {
    try {
      if (useFirestore) {
        await ensureAnonymousAuth();
        await firestoreManager.add('rentings', renting);
        setRentings(prev => [...prev, renting]);
      } else if (useLocalStorage) {
        localStorageStorage.addRenting(renting);
        setRentings(prev => [...prev, renting]);
      } else {
        await database.add('rentings', renting);
        setRentings(prev => [...prev, renting]);
      }
    } catch (error) {
      console.error('Failed to add renting (Firestore):', error);
    }
  };

  const updateRenting = async (renting: Renting) => {
    try {
      if (useFirestore) {
        await ensureAnonymousAuth();
        await firestoreManager.update('rentings', renting);
        setRentings(prev => prev.map(r => r.id === renting.id ? renting : r));
      } else if (useLocalStorage) {
        localStorageStorage.updateRenting(renting);
        setRentings(prev => prev.map(r => r.id === renting.id ? renting : r));
      } else {
        await database.update('rentings', renting);
        setRentings(prev => prev.map(r => r.id === renting.id ? renting : r));
      }
    } catch (error) {
      console.error('Failed to update renting (Firestore):', error);
    }
  };

  const deleteRenting = async (id: string) => {
    try {
      if (useFirestore) {
        await ensureAnonymousAuth();
        await firestoreManager.delete('rentings', id);
        setRentings(prev => prev.filter(r => r.id !== id));
      } else if (useLocalStorage) {
        localStorageStorage.deleteRenting(id);
        setRentings(prev => prev.filter(r => r.id !== id));
      } else {
        await database.delete('rentings', id);
        setRentings(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete renting (Firestore):', error);
    }
  };

  return {
    isInitialized,
    useLocalStorage,
    useFirestore,
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
    loadData: useFirestore ? loadDataFromFirestore : (useLocalStorage ? loadDataFromLocalStorage : loadData)
  };
};