const admin = require("firebase-admin");
const { cert, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const key = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

if (!admin.apps.length) {
  initializeApp({
    credential: cert(key),
  });
}

export const db = getFirestore();

export const mergeFirestoreDoc = async (data, collection, doc) => {
  await db.collection(collection).doc(doc).set(data, { merge: true });
  return { success: true };
};

export const getSingleFirestoreDoc = async (collection, doc) => {
  const docRef = await db.collection(collection).doc(doc).get();
  if (!docRef.exists) {
    return null;
  } else {
    return docRef.data();
  }
};

export const simpleQuery = async (name, value, collection) => {
  const collectionRef = db.collection(collection);
  const snapshot = await collectionRef.where(name, "==", value).get();
  if (snapshot.empty) {
    console.log("No matching documents.");
    return;
  }
  return snapshot.docs.map((doc) => doc.data());
};

export const addNewDoc = async (collection, doc, data) =>
  await db.collection(collection).doc(doc).set(data);

export const deleteSingleFirestoreDoc = async (collection, doc) =>
  await db.collection(collection).doc(doc).delete();
