import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  getDoc,
  setDoc,
  query,
  where,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import app from "./firebase";

export const db = getFirestore(app);

export const COLLECTION_NAMES = {};

export const addFirestoreDoc = async (col, data) => {
  try {
    const docRef = await addDoc(collection(db, col), data);
    return { docId: docRef.id };
  } catch (e) {
    console.error("Error adding document: ", e);
    return { error: e };
  }
};
export const getFirebaseDocs = async (col) => {
  const querySnapshot = await getDocs(collection(db, col));
  return [...querySnapshot.map((doc) => ({ id: doc.id, ...doc.data() }))];
};
export const mergeFirestoreDoc = async (data, ...path) => {
  try {
    const collectionRef = doc(db, ...path);
    await setDoc(collectionRef, data, { merge: true });
    return { success: true };
  } catch (e) {
    console.log(e);
    return { error: e };
  }
};
export const updateFirestoreDoc = async (data, ...path) => {
  try {
    const collectionRef = doc(db, ...path);
    await updateDoc(collectionRef, data);
    return { success: true };
  } catch (e) {
    console.log(e);
    return { error: e };
  }
};
export const getSingleFirestoreDoc = async (...path) => {
  try {
    const docRef = doc(db, ...path);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (e) {
    return { error: e };
  }
};

export const simpleQuery = async (name, value, ...collectionPath) => {
  const collectionRef = collection(db, ...collectionPath);
  const q = query(collectionRef, where(name, "==", value));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const deleteSingleFirestoreDoc = async (...path) => {
  try {
    const docRef = doc(db, ...path);
    await deleteDoc(docRef);
  } catch (e) {
    return { error: e };
  }
};
