import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  deleteDoc,
  doc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TestFirebaseService {
  constructor(private firestore: Firestore) {}

  getItems(): Observable<any[]> {
    const itemsCollection = collection(this.firestore, 'items');
    return collectionData(itemsCollection, { idField: 'id' });
  }

  addItem(item: any): Promise<any> {
    const itemsCollection = collection(this.firestore, 'items');
    return addDoc(itemsCollection, item);
  }

  deleteItem(itemId: string): Promise<void> {
    const itemDoc = doc(this.firestore, `items/${itemId}`);
    return deleteDoc(itemDoc);
  }
}
