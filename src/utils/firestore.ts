import { getFirestore, Firestore, collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { getFirebaseApp } from './firebase';

class FirestoreManager {
  private db: Firestore | null = null;

  init(): void {
    if (!this.db) {
      const app = getFirebaseApp();
      this.db = getFirestore(app);
    }
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) this.init();
    try {
      const snap = await getDocs(collection(this.db!, storeName));
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as T);
    } catch (e) {
      console.error(`[Firestore] getAll failed for ${storeName}:`, e);
      throw e;
    }
  }

  async add<T extends { id: string }>(storeName: string, data: T): Promise<void> {
    if (!this.db) this.init();
    try {
      let id = data?.id;
      if (!id) {
        // Auto-generate an ID if missing
        const ref = doc(collection(this.db!, storeName));
        id = ref.id;
        (data as any).id = id;
        await setDoc(ref, data as any, { merge: false });
        return;
      }
      await setDoc(doc(this.db!, storeName, id), data as any, { merge: false });
    } catch (e) {
      console.error(`[Firestore] add failed for ${storeName}:`, e, data);
      throw e;
    }
  }

  async update<T extends { id: string }>(storeName: string, data: T): Promise<void> {
    if (!this.db) this.init();
    try {
      await setDoc(doc(this.db!, storeName, data.id), data as any, { merge: true });
    } catch (e) {
      console.error(`[Firestore] update failed for ${storeName}/${data.id}:`, e, data);
      throw e;
    }
  }

  async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) this.init();
    try {
      await deleteDoc(doc(this.db!, storeName, id));
    } catch (e) {
      console.error(`[Firestore] delete failed for ${storeName}/${id}:`, e);
      throw e;
    }
  }
}

export const firestoreManager = new FirestoreManager();
