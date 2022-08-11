import { useAuth } from "lib/AuthUserContext";
import {
  COLLECTION_NAMES,
  deleteSingleFirestoreDoc,
  getSingleFirestoreDoc,
  simpleQuery,
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
    </Container>
  );
};

export default View;

export async function getServerSideProps({ params }) {
  return {
    props: { id: params.id },
  };
}
