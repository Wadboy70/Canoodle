import { useAuth } from "lib/AuthUserContext";
import { COLLECTION_NAMES, getSingleFirestoreDoc } from "lib/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Form from "components/Form";
import styles from "styles/View.module.css";
import { RenderInstructions } from "pages/edit";
import Container from "components/Container";

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

      if (recipeData && !recipeData.error) {]
        setRecipe(recipeData);
      }
      setloadingRecipe(false);
    };
    if (recipe === null && authUser) getRecipe();
  });

  if (loading || loadingRecipe) {
    return (
      <div className={styles.main}>
        <p>loading...</p>
      </div>
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
      <Form>
        <br />
        <h2>Instructions</h2>
        <RenderInstructions instructions={recipe.instructions} top />
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
