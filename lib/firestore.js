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
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import app from "./firebase";

export const db = getFirestore(app);

export const COLLECTION_NAMES = {
  USERS: "USERS",
  RECIPE_LISTS: "RECIPE_LISTS_B",
  RECIPE_DATA: "RECIPE_DATA_B",
  RECIPE_LIST_DATA: "RECIPE_LIST_DATA_B",
  LIST_DATA: "LIST_DATA",
};

export const addFirestoreDoc = async (col, data) => {
  try {
    const docRef = await addDoc(collection(db, col), data);
    return { docId: docRef.id };
  } catch (e) {
    console.error("Error adding document: ", e);
    return { error: e };
  }
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
      return { ...docSnap.data(), id: docSnap.id };
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

export const checkForSimilarRecipe = async (recipeURL, uid) => {
  if (!recipeURL) return false;

  const collectionRef = collection(db, COLLECTION_NAMES.RECIPE_DATA);
  const q = query(
    collectionRef,
    where("recipeURL", "==", recipeURL),
    where("uid", "==", uid)
  );
  return !(await getDocs(q)).empty;
};

export const addUnsortedRecipe = async (recipeData) => {
  const newRecipe = await addFirestoreDoc(
    COLLECTION_NAMES.RECIPE_DATA,
    recipeData
  );
  if (!newRecipe || newRecipe.error) return false;
  return true;
};

export const getSingleRecipe = async (recipeId) => {
  return await getSingleFirestoreDoc(COLLECTION_NAMES.RECIPE_DATA, recipeId);
};

export const getRecipesFromList = async (list) => {
  if (!Array.isArray(list)) return null;

  return Promise.all(
    list
      .map(async (recipeId) => await getSingleRecipe(recipeId))
      .filter((v) => !!v)
  );
};

export const moveRecipe = async (
  recipeId,
  destinationId,
  homeId = undefined
) => {
  //add recipe to new list
  const destinationRecipe = await getSingleFirestoreDoc(
    COLLECTION_NAMES.RECIPE_LIST_DATA,
    destinationId
  );
  if (destinationRecipe?.recipes?.find((v) => v === recipeId)) return;

  const add = await updateFirestoreDoc(
    {
      recipes: arrayUnion(recipeId),
    },
    COLLECTION_NAMES.RECIPE_LIST_DATA,
    destinationId
  );

  if (add.error || !homeId) return;

  //delete recipe from old list
  await updateFirestoreDoc(
    {
      recipes: arrayRemove(recipeId),
    },
    COLLECTION_NAMES.RECIPE_LIST_DATA,
    homeId
  );
}; // no error checking

export const removeRecipeFromList = async (recipeId, listId) => {
  return await updateFirestoreDoc(
    {
      recipes: arrayRemove(recipeId),
    },
    COLLECTION_NAMES.RECIPE_LIST_DATA,
    listId
  );
};
