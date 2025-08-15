import { getFirestore, Firestore, collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { getFirebaseApp } from './firebase';

class FirestoreManager {
  private db: Firestore | null = null;

  // Remove undefined values recursively to satisfy Firestore (which disallows undefined)
  private sanitize<T>(value: T): T {
    if (Array.isArray(value)) {
      return value.map((v) => this.sanitize(v)) as unknown as T;
    }
    if (value && typeof value === 'object') {
      const obj = value as Record<string, any>;
      const out: Record<string, any> = {};
      Object.keys(obj).forEach((k) => {
        const v = obj[k];
        if (v === undefined) return; // drop undefined
        out[k] = this.sanitize(v);
      });
      return out as T;
    }
    return value;
  }

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
        const clean = this.sanitize(data) as any;
        await setDoc(ref, clean, { merge: false });
        return;
      }
      const clean = this.sanitize(data) as any;
      await setDoc(doc(this.db!, storeName, id), clean, { merge: false });
    } catch (e) {
      console.error(`[Firestore] add failed for ${storeName}:`, e, data);
      throw e;
    }
  }

  async update<T extends { id: string }>(storeName: string, data: T): Promise<void> {
    if (!this.db) this.init();
    try {
      const clean = this.sanitize(data) as any;
      await setDoc(doc(this.db!, storeName, data.id), clean, { merge: true });
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
