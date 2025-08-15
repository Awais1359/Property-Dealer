import { Property, Client, Deal, Reminder, Renting } from '../types';

const DB_NAME = 'PropertyDealerDB';
const DB_VERSION = 4;

class DatabaseManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Properties store
        if (!db.objectStoreNames.contains('properties')) {
          const propertyStore = db.createObjectStore('properties', { keyPath: 'id' });
          propertyStore.createIndex('propertyId', 'propertyId', { unique: true });
          propertyStore.createIndex('status', 'status');
          propertyStore.createIndex('type', 'type');
        }

        // Clients store
        if (!db.objectStoreNames.contains('clients')) {
          const clientStore = db.createObjectStore('clients', { keyPath: 'id' });
          clientStore.createIndex('name', 'name');
          clientStore.createIndex('mobile', 'mobile');
          clientStore.createIndex('type', 'type');
        }

        // Deals store
        if (!db.objectStoreNames.contains('deals')) {
          const dealStore = db.createObjectStore('deals', { keyPath: 'id' });
          dealStore.createIndex('propertyId', 'propertyId');
          dealStore.createIndex('buyerId', 'buyerId');
          dealStore.createIndex('sellerId', 'sellerId');
        }

        // Reminders store
        if (!db.objectStoreNames.contains('reminders')) {
          const reminderStore = db.createObjectStore('reminders', { keyPath: 'id' });
          reminderStore.createIndex('dueDate', 'dueDate');
          reminderStore.createIndex('type', 'type');
          reminderStore.createIndex('completed', 'completed');
        }

        // Rentings store
        if (!db.objectStoreNames.contains('rentings')) {
          const rentingStore = db.createObjectStore('rentings', { keyPath: 'id' });
          rentingStore.createIndex('rentingId', 'rentingId', { unique: true });
          rentingStore.createIndex('propertyType', 'propertyType');
          rentingStore.createIndex('availabilityStatus', 'availabilityStatus');
        }
      };
    });
  }

  async add<T>(storeName: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));
      
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));
      
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async update<T>(storeName: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));
      
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));
      
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async search<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not initialized'));
      
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
}

export const database = new DatabaseManager();