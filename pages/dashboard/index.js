import { arrayRemove } from "firebase/firestore";
import { useAuth } from "lib/AuthUserContext";
import {
  addFirestoreDoc,
  COLLECTION_NAMES,
  updateFirestoreDoc,
  deleteSingleFirestoreDoc,
  simpleQuery,
  getdisplayRecipeImg,
  getSingleFirestoreDoc,
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
import AllRecipes from "./all";
import { SUB_LEVELS } from "lib/constants";

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
    if (!userLists) {
      setGallery([]);
      return;
    }
    for (const i of userLists) {
      i.image = await getdisplayRecipeImg(i.id);
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
    //check if list can be added
    const listCount = (
      await simpleQuery("uid", authUser.uid, COLLECTION_NAMES.LIST_DATA)
    ).length;
    //realistically this logic needs to be moved to the backend
    const isPremium =
      (await getSingleFirestoreDoc(COLLECTION_NAMES.USERS, authUser.uid))
        .subscription === SUB_LEVELS.LIFETIME;

    if (listCount > 2 && !isPremium) {
      //AND user is not premium
      alert("Upgrade to premium to add more lists!");
      return;
    }

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
          <h2>Lists</h2>
          <div className="w-full grid grid-cols-2 md:grid-cols-4 px-10">
            {gallery &&
              gallery.map((list) => (
                <Link href={`/dashboard/${list.id}`} key={list.id}>
                  <a className="p-4">
                    <div
                      className="w-full bg-cover grow bg-center aspect-video rounded-xl"
                      style={{
                        backgroundImage: `url(${
                          typeof list.image === "string"
                            ? list.image
                            : Array.isArray(list.image)
                            ? list?.image?.[0]
                            : list.image?.url
                            ? list.image.url
                            : "/default.jpg"
                        })`,
                      }}
                      alt={list.name}
                    />
                    <p className="w-full text-center">{list.name}</p>
                  </a>
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
          <AllRecipes />
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
      <Button
        onClick={() => {
          setShowPopup(true);
        }}
        shadow
      >
        Add List
      </Button>
    </div>
  );
};

export default Dashboard;
