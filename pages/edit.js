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
import styles from "styles/Edit.module.css";

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

const replaceAt = (array, index, value) => {
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
  drill = ["instructions"],
  setParsedRecipe,
  parsedRecipe
) => {
  return (
    <ListType top={top}>
      {instructions.map((instruction, i) => {
        if (typeof instruction === "object") {
          return (
            <li>
              <ul key={i}>
                <li>
                  <input
                    type="text"
                    value={instruction.name}
                    onChange={(e) => {
                      setParsedRecipe(
                        drillAndReplace(
                          parsedRecipe,
                          [...drill, i, "name"],
                          e.target.value
                        )
                      );
                    }}
                    style={{ width: "100%" }}
                  />
                </li>
                {renderInstructions(
                  instruction.subElements,
                  false,
                  [...drill, i, "subElements"],
                  setParsedRecipe,
                  parsedRecipe
                )}
              </ul>
            </li>
          );
        }
        return (
          <li key={i} className={styles["grow-wrap"]}>
            <textarea
              type="text"
              value={instruction}
              onChange={(e) => {
                setParsedRecipe(
                  drillAndReplace(parsedRecipe, [...drill, i], e.target.value)
                );
              }}
            />
          </li>
        );
      })}
    </ListType>
  );
};

const Edit = ({ recipe }) => {
  const [parsedRecipe, setParsedRecipe] = useState(
    recipe ? JSON.parse(recipe) : null
  );
  const router = useRouter();
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  if (!recipe) {
    return (
      <div className={styles.main}>
        <p>This recipe cannot be found :(</p>
      </div>
    );
  }

  return (
    <div className={styles.main}>
      <h1>Edit Recipe</h1>
      <Form>
        <Button
          onClick={async () => {
            if (loading) return;
            setLoading(true);
            if (authUser) {
              const newDoc = await addFirestoreDoc(
                COLLECTION_NAMES.RECIPE_DATA,
                parsedRecipe
              );
              const exists = await getSingleFirestoreDoc(
                COLLECTION_NAMES.RECIPE_LISTS,
                authUser.uid
              );

              if (exists) {
                console.log(
                  await updateFirestoreDoc(
                    { "All_Recipes.list": arrayUnion(newDoc.docId) },
                    COLLECTION_NAMES.RECIPE_LISTS,
                    authUser.uid
                  )
                );
              } else
                await mergeFirestoreDoc(
                  {
                    All_Recipes: { list: [newDoc.docId], name: "All Recipes" },
                    uid: authUser.uid,
                  },
                  COLLECTION_NAMES.RECIPE_LISTS,
                  authUser.uid
                );
              router.push("/dashboard");
            } else if (typeof window !== "undefined") {
              alert("log in to save recipes!");
            }
            setLoading(false);
          }}
        >
          Save Recipe
        </Button>
        <Button>Discard Recipe</Button>
        <br />
        {loading && <p>loading...</p>}
        <h2>Instructions</h2>
        {renderInstructions(
          parsedRecipe.instructions,
          true,
          ["instructions"],
          setParsedRecipe,
          parsedRecipe
        )}
        <h2>Ingredients</h2>
        <ul>
          {parsedRecipe.ingredients.map((ingredient, i) => (
            <li key={i}>
              <input
                type="text"
                value={ingredient}
                onChange={(e) =>
                  setParsedRecipe({
                    ...parsedRecipe,
                    ingredients: replaceAt(
                      parsedRecipe.ingredients,
                      i,
                      e.target.value
                    ),
                  })
                }
                style={{ width: "100%" }}
              />
            </li>
          ))}
        </ul>
      </Form>
    </div>
  );
};

export default Edit;

export async function getServerSideProps(context) {
  const recipes = await getRecipe(context.query.url);

  if (!recipes) return { props: {} };

  return {
    props: {
      recipe: JSON.stringify({ ...recipes, recipeURL: context.query.url }),
    },
  };
}
