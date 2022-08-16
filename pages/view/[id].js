import { useAuth } from "lib/AuthUserContext";
import {
  addFirestoreDoc,
  COLLECTION_NAMES,
  complexQuery,
  deleteSingleFirestoreDoc,
  getSingleFirestoreDoc,
  simpleQuery,
  updateFirestoreDoc,
} from "lib/firestore";
import { useEffect, useState } from "react";
import Form from "components/Form";
import styles from "styles/View.module.css";
import Container from "components/Container";
import { RenderInstructions } from "components/RecipeRendering";
import Image from "next/image";
import Button from "components/Button";
import { useRouter } from "next/router";
import Loader from "components/Loader";
import { PopupOverlayAndForm } from "components/PopupInput";
import { where } from "firebase/firestore";

export const replaceAt = (array, index, value) => {
  const ret = array.slice(0);
  ret[index] = value;
  return ret;
};

const View = ({ id }) => {
  const router = useRouter();
  const { authUser, loading } = useAuth();
  const [loadingRecipe, setloadingRecipe] = useState(true);
  const [recipe, setRecipe] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const getRecipe = async () => {
      const recipeData = await getSingleFirestoreDoc(
        COLLECTION_NAMES.RECIPE_DATA,
        id
      );

      if (recipeData && !recipeData.error) {
        setRecipe(recipeData);
      }
      setloadingRecipe(false);
    };
    if (recipe === null && authUser) getRecipe();
  });

  if (loading || loadingRecipe) {
    return (
      <Container>
        <Loader />
      </Container>
    );
  } else if (authUser === null && !loading) {
    return (
      <div className={styles.main}>
        <p>
          You can only access this page when authenticated :( Please click the
          login button above!
        </p>
      </div>
    );
  } else if (!recipe) {
    return (
      <div className={styles.main}>
        <p>This recipe is not available :(</p>
      </div>
    );
  }

  const deleteRecipe = async () => {
    if (typeof window === "undefined") return;
    const deleteConf = confirm(
      "do you want to delete this recipe? this cannot be undone"
    );
    if (!deleteConf) return;
    setloadingRecipe(true);
    //delete recipe
    await deleteSingleFirestoreDoc(COLLECTION_NAMES.RECIPE_DATA, id);
    //get all lists that the recipe is in
    const recipeLists = await simpleQuery(
      "recipe_id",
      id,
      COLLECTION_NAMES.RECIPE_LISTS
    );
    //delete the recipe from all of those lists
    recipeLists?.forEach(async (recipeList) => {
      await deleteSingleFirestoreDoc(
        COLLECTION_NAMES.RECIPE_LISTS,
        recipeList.id
      );
    });

    setloadingRecipe(false);
    router.push("/dashboard");
  };

  const turnOnForm = () => setShowForm(true);

  return (
    <Container>
      <div
        style={{
          //this block is repeated in many files; DRY it
          backgroundImage: `url(${
            typeof recipe.image === "string"
              ? recipe.image
              : Array.isArray(recipe.image)
              ? typeof recipe?.image?.[0] === "string"
                ? recipe?.image?.[0]
                : recipe?.image?.[0].url
              : recipe.image.url
          })`,
        }}
        className={styles.banner}
      />
      <h1>{recipe.name}</h1>
      <Button onClick={deleteRecipe}>
        <Image src="/trash.svg" width="20" height="20" alt="trash Logo" />
      </Button>
      <Button onClick={turnOnForm}>
        <Image src="/plus.svg" width="20" height="20" alt="plus Logo" />
      </Button>
      <Form>
        <br />
        <h2>Instructions</h2>
        <RenderInstructions instructions={recipe.instructions} />
        <h2>Ingredients</h2>
        <ul>
          {recipe.ingredients.map((ingredient, i) => (
            <li key={i}>
              <p>{ingredient}</p>
            </li>
          ))}
        </ul>
      </Form>
      <AddRecipeForm
        showForm={showForm}
        setShowForm={setShowForm}
        recipeId={id}
      />
    </Container>
  );
};

const AddRecipeForm = ({ showForm, setShowForm, recipeId }) => {
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lists, setLists] = useState(undefined);

  const getLists = async () => {
    setLoading(true);
    const listsWithRecipe = await simpleQuery(
      "recipe_id",
      recipeId,
      COLLECTION_NAMES.RECIPE_LISTS
    );
    const lists = (
      await simpleQuery("uid", authUser.uid, COLLECTION_NAMES.LIST_DATA)
    )?.map((list) => {
      let checked = false;
      if (
        listsWithRecipe?.find(
          (listWithRecipe) => listWithRecipe.list_id === list.id
        )
      )
        checked = true;
      return { checked, ...list };
    });

    if ((!lists || !listsWithRecipe) && typeof window === "undefined") {
      alert("error loading lists");
      setShowForm(false);
      setLoading(false);
    }

    setLists(lists);
    setLoading(false);
  };
  useEffect(() => {
    if (lists === undefined) getLists();
  }, [showForm]);

  useEffect(() => {
    console.log(lists);
  }, [lists]);

  if (!showForm) return null;

  const turnOffForm = () => setShowForm(false);

  const changeListChecked = async (e, list) => {
    setLoading(true);

    const currVal = await complexQuery(
      [where("recipe_id", "==", recipeId), where("list_id", "==", list.id)],
      COLLECTION_NAMES.RECIPE_LISTS
    );

    if (e.target.checked) {
      // we are trying to add the recipe to the list
      if (!currVal.length) {
        // if the recipe is NOT already in the list
        await addFirestoreDoc(COLLECTION_NAMES.RECIPE_LISTS, {
          list_id: list.id,
          recipe_id: recipeId,
        });
      }
    } else if (e.target.checked === false) {
      if (currVal.length) {
        currVal.forEach(async (val) => {
          await deleteSingleFirestoreDoc(COLLECTION_NAMES.RECIPE_LISTS, val.id);
        });
      }
    }

    await getLists();
  };

  return (
    <PopupOverlayAndForm hidePopup={turnOffForm}>
      {loading ? (
        <Loader />
      ) : lists ? (
        <ul>
          {lists.map((list) => {
            return (
              <li key={list.id}>
                <input
                  type="checkbox"
                  name={list.name}
                  id={list.id}
                  defaultChecked={list.checked}
                  onChange={(e) => changeListChecked(e, list)}
                />
                <span>{list.name}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <span></span>
      )}
    </PopupOverlayAndForm>
  );
};

export default View;

export async function getServerSideProps({ params }) {
  return {
    props: { id: params.id },
  };
}
