import { arrayUnion } from "firebase/firestore";
import { useAuth } from "lib/AuthUserContext";
import {
  addFirestoreDoc,
  COLLECTION_NAMES,
  getSingleFirestoreDoc,
  mergeFirestoreDoc,
  simpleQuery,
  updateFirestoreDoc,
} from "lib/firestore";
import getRecipe from "lib/getRecipe";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Button from "src/Button";
import Form from "src/Form";
import styles from "styles/View.module.css";

const drillAndReplace = (obj, arr, rep) => {
  console.log(obj, arr);
  if (!arr.length) return rep;
  return Array.isArray(obj)
    ? replaceAt(obj, arr[0], drillAndReplace(obj[arr[0]], arr.slice(1), rep))
    : {
        ...obj,
        [arr[0]]: drillAndReplace(obj[arr[0]], arr.slice(1), rep),
      };
};

export const replaceAt = (array, index, value) => {
  const ret = array.slice(0);
  ret[index] = value;
  return ret;
};

const ListType = ({ top, children }) => {
  if (top) return <ol>{children}</ol>;
  else
    return (
      <li>
        <ul>{children}</ul>
      </li>
    );
};

const renderInstructions = (
  instructions,
  top = false,
  drill = ["instructions"]
) => {
  return (
    <ListType top={top}>
      {instructions.map((instruction, i) => {
        if (typeof instruction === "object") {
          return (
            <li>
              <ul key={i}>
                <li>
                  <p>{instruction.name}</p>
                </li>
                {renderInstructions(instruction.subElements, false, [
                  ...drill,
                  i,
                  "subElements",
                ])}
              </ul>
            </li>
          );
        }
        return (
          <li key={i} className={styles["grow-wrap"]}>
            <p>{instruction}</p>
          </li>
        );
      })}
    </ListType>
  );
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
        console.log(recipeData);
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
    <div className={styles.main}>
      <div
        style={{
          "background-image": `url(${
            typeof recipe.image === "string" ? recipe.image : recipe?.image?.[0]
          })`,
        }}
        className={styles.banner}
      />
      <h1>{recipe.name}</h1>
      <Form>
        <br />
        <h2>Instructions</h2>
        {renderInstructions(recipe.instructions, true, ["instructions"])}
        <h2>Ingredients</h2>
        <ul>
          {recipe.ingredients.map((ingredient, i) => (
            <li key={i}>
              <p>{ingredient}</p>
            </li>
          ))}
        </ul>
      </Form>
    </div>
  );
};

export default View;

export async function getServerSideProps({ params }) {
  return {
    props: { id: params.id },
  };
}
