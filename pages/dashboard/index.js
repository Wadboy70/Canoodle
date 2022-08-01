import { arrayRemove, arrayUnion } from "firebase/firestore";
import { useAuth } from "lib/AuthUserContext";
import {
  addFirestoreDoc,
  COLLECTION_NAMES,
  getSingleFirestoreDoc,
  moveRecipe,
  updateFirestoreDoc,
  removeRecipeFromList,
  deleteSingleFirestoreDoc,
  simpleQuery,
} from "lib/firestore";
import Link from "next/link";
import { useEffect, useState, useContext } from "react";
import Button from "components/Button";
import Container from "components/Container";
import PopupInput from "components/PopupInput";
import Loader from "components/Loader";
import { useRouter } from "next/router";
import { RecipeContext, RecipeProvider } from "lib/recipeContext";
import { SelectContext, SelectProvider } from "lib/selectContext";

const Dashboard = () => {
  const { authUser, loading } = useAuth();
  const [gallery, setGallery] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const populateGallery = async () => {
    const userLists = await simpleQuery(
      "uid",
      authUser.uid,
      COLLECTION_NAMES.LIST_DATA
    );
    console.log(userLists);
    if (!userLists) {
      setGallery([]);
      return;
    }
    setGallery(userLists);
  };
  useEffect(() => {
    if (gallery === null && authUser) populateGallery();
  }, [authUser]);

  if (loading) {
    return (
      <Container>
        <p>loading...</p>
      </Container>
    );
  } else if (authUser === null && !loading) {
    return (
      <Container>
        <p>
          You can only access this page when authenticated :( Please click the
          login button above!
        </p>
      </Container>
    );
  }

  const popupSubmit = async (listName, setListName) => {
    const trimmedListName = listName?.trim();
    if (!trimmedListName) return;

    const sameName = await simpleQuery(
      "name",
      trimmedListName,
      COLLECTION_NAMES.LIST_DATA
    );
    if (!sameName || sameName.error) {
      alert("Error adding a new list");
      return;
    }

    if (sameName.length) {
      alert("Invalid list name, you may have used this name already!");
      return;
    }

    const newDoc = await addFirestoreDoc(COLLECTION_NAMES.LIST_DATA, {
      uid: authUser.uid,
      name: trimmedListName,
    });
    if (!newDoc || newDoc.error) {
      alert("Error adding a new list");
      return;
    }

    setListName(null);
    setShowPopup(false);
    populateGallery();
  };

  return (
    <Container>
      <SelectProvider>
        <RecipeProvider>
          <div className="flex justify-center items-center flex-col w-full">
            <h1>Dashboard</h1>
            <ControlPanel setShowPopup={setShowPopup} gallery={gallery} />
          </div>
          <div className="w-full flex flex-col grow">
            <Link href={`/dashboard/all`}>
              <a>All Recipes</a>
            </Link>
            {gallery &&
              gallery.map((list) => (
                <Link href={`/dashboard/${list.id}`} key={list.id}>
                  <a>{list.name}</a>
                </Link>
              ))}
            {showPopup && (
              <PopupInput
                onSubmit={popupSubmit}
                placeholder="New List Name"
                name="Add New List"
                setShowPopup={setShowPopup}
              />
            )}
          </div>
        </RecipeProvider>
      </SelectProvider>
    </Container>
  );
};

const ControlPanel = ({ setShowPopup, gallery, populateGallery }) => {
  const { editMode, setEditMode, select } = useContext(SelectContext);
  const { hydrateRecipes, setHydrateRecipes } = useContext(RecipeContext);
  const { authUser } = useAuth();
  const router = useRouter();

  const handleShoppingList = async (e) => {
    if (typeof window === "undefined") return;
    if (!select.length) {
      alert("You must select recipes to make a grocery list!");
      return;
    }
    await updateFirestoreDoc(
      {
        groceries: select,
      },
      COLLECTION_NAMES.RECIPE_LISTS,
      authUser.uid
    );
    //loading
    router.push("/list");
  };

  const deleteSelectedRecipes = async () => {
    if (typeof window === undefined) return;
    console.log(gallery.values, select);
    //remove recipe id from lists
    select?.forEach(async (recipeId) => {
      gallery?.values?.forEach(async (recipeList) => {
        await updateFirestoreDoc(
          {
            recipes: arrayRemove(recipeId),
          },
          COLLECTION_NAMES.RECIPE_LIST_DATA,
          recipeList.id
        );
      });
      //remove recipe from unsorted recipe list
      await updateFirestoreDoc(
        {
          unsorted: arrayRemove(recipeId),
        },
        COLLECTION_NAMES.RECIPE_LISTS,
        authUser.uid
      );
      // //delete recipe from data
      await deleteSingleFirestoreDoc(COLLECTION_NAMES.RECIPE_DATA, recipeId);
    });

    //refresh everything on the page
    populateGallery();
    setHydrateRecipes(hydrateRecipes + 1);
  };

  return (
    <div className="flex flex-row justify-end w-full">
      {editMode ? (
        <>
          <Button
            onClick={deleteSelectedRecipes}
            squared
            gray
            shadow
            customColor
            className="bg-green-200"
          >
            Delete Selected Recipes
          </Button>

          <Button
            onClick={handleShoppingList}
            squared
            gray
            shadow
            customColor
            className="bg-green-200"
          >
            {" "}
            {select.length} Shopping List Recipe{select.length == 1 ? "" : "s"}
          </Button>
        </>
      ) : (
        <Button
          onClick={() => {
            setShowPopup(true);
          }}
          squared
          gray
          shadow
          customColor
          className="bg-green-200"
        >
          Add List
        </Button>
      )}
      <Button
        onClick={() => {
          setEditMode(!editMode);
        }}
        squared
        gray
        shadow
        customColor
        className="bg-yellow-100"
      >
        {editMode ? "Exit Selection Mode" : "Select/ Edit Recipes"}
      </Button>
    </div>
  );
};

export default Dashboard;
