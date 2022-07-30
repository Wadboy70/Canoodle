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
import Image from "next/image";
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
    const listInfo = await getSingleFirestoreDoc(
      COLLECTION_NAMES.RECIPE_LISTS,
      authUser.uid
    );
    const realListName = listName.replace(/\s+/g, "");
    if (!listInfo || listInfo.error) setListName(null);
    if (
      listInfo.values?.find((recObj) => recObj.name === realListName) ||
      realListName === ""
    ) {
      alert("Invalid list name, you may have used this name already!");
      return;
    }
    const newDoc = await addFirestoreDoc(COLLECTION_NAMES.RECIPE_LIST_DATA, {
      recipes: [],
    });
    if (!newDoc || newDoc.error) {
      alert("Error fetching data");
      return;
    }
    await updateFirestoreDoc(
      {
        values: arrayUnion({
          name: listName.trim(),
          id: newDoc.docId,
        }),
      },
      COLLECTION_NAMES.RECIPE_LISTS,
      authUser.uid
    );
    setListName("null");
    setShowPopup(false);
    populateGallery();
  };

  return (
    <Container>
      <SelectProvider>
        <RecipeProvider>
          <div className="flex justify-center items-center flex-col w-full">
            <h1>Dashboard</h1>
            <ControlPanel
              setShowPopup={setShowPopup}
              gallery={gallery}
              populateGallery={populateGallery}
            />
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
                setPopupView={setShowPopup}
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

const RecipeList = ({ recipeData, expandedDefault = false }) => {
  const [expanded, setExpanded] = useState(expandedDefault);
  const [recipeList, setRecipeList] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const { recipes, setRecipes, hydrateRecipes } = useContext(RecipeContext);
  const { currentDrag, setCurrentDrag } = useContext(SelectContext);

  const populateRecipeIds = async () => {
    setLoading(true);

    let recipesIds;

    //first if is for when an idlist is manually passed in, the else is for getting a recipe list from the database
    if (recipeData.recipeIdList) {
      recipesIds = recipeData.recipeIdList;
    } else {
      let recipeListData = await getSingleFirestoreDoc(
        COLLECTION_NAMES.RECIPE_LIST_DATA,
        recipeData.id
      );

      recipesIds = recipeListData.recipes;
    }

    //this should loop through recipes, check if there is already a value in the object, and if not, pull that value from the database
    const finalVals = (
      await Promise.all(
        recipesIds?.map(async (recipeId) => {
          if (!recipes[recipeId]) {
            const recipe = await getSingleFirestoreDoc(
              COLLECTION_NAMES.RECIPE_DATA,
              recipeId
            );
            if (!recipe || recipe.error) return null;

            return recipe;
          }
        })
      )
    )
      .filter((v) => !!v)
      .reduce((a, v) => ({ ...a, [v.id]: v }), {});

    setRecipes({ ...recipes, ...finalVals });

    setRecipeList(recipesIds);

    setLoading(false);
  };

  useEffect(() => {
    if (expanded) {
      populateRecipeIds();
    }
  }, [expanded, recipeData, hydrateRecipes]);

  const handleDragEnter = (e) => {
    e.stopPropagation();
    if (currentDrag.homeRecipe && currentDrag.homeList != recipeData.id) {
      setCurrentDrag({
        ...currentDrag,
        destinationList: recipeData.id,
      });
    }
  };

  return (
    <div
      className={`min-h-12 ${
        currentDrag.destinationList === recipeData.id
          ? "outline outline-2 outline-black rounded-6"
          : ""
      }`}
      onDragEnter={handleDragEnter}
    >
      <span className="font-bold text-2xl flex">
        <h2 className="mr-4 text-2xl m-2">
          {recipeData.name && recipeData.name}
        </h2>
        <button
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          <Image
            src={expanded ? "/chevron-up.svg" : "/chevron-down.svg"}
            width="20"
            height="20"
            alt="chevron"
          />
        </button>
      </span>
      <div
        className={`grid grid-cols-dashRecipe gap-6 w-full items-center items-stretch ${
          expanded ? "" : "h-0"
        }`}
      >
        {loading ? (
          <Loader />
        ) : (
          expanded &&
          recipeList?.map((recipeId) => (
            <Recipe
              recipe={{ ...recipes[recipeId], id: recipeId }}
              key={recipeId}
              listId={recipeData.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

const DraggedRecipe = ({ recipe, position }) => {
  return (
    <div
      className={`border-black rounded-xl border-solid border border-0 overflow-hidden m-2 bg-white shadow-xl flex flex-col fixed w-40 pointer-events-none`}
      style={{ top: position.y, left: position.x }}
    >
      {recipe.image && (
        <div
          className="w-full bg-cover grow bg-center h-40"
          style={{
            backgroundImage: `url(${
              typeof recipe.image === "string"
                ? recipe.image
                : Array.isArray(recipe.image)
                ? recipe?.image?.[0]
                : recipe.image.url
            })`,
          }}
          alt={recipe.name}
        />
      )}
      <h3 className="leading-10 mx-3 truncate w-4/5">{recipe.name}</h3>
    </div>
  );
};
export default Dashboard;
