import { useAuth } from "lib/AuthUserContext";
import { addUnsortedRecipe, checkForUserListOrCreate } from "lib/firestore";
import getRecipe from "lib/getRecipe";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Button from "components/Button";
import Form from "components/Form";
import styles from "styles/Edit.module.css";
import Image from "next/image";
import Container from "components/Container";

const drillAndReplace = (obj, arr, rep) => {
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

export const RenderInstructions = ({
  instructions,
  drill = ["instructions"],
  onChangeInput = () => {},
  editMode = false,
  top = false,
  onChangeTextAreaInput = () => {},
}) => {
  return (
    <ListType top={top}>
      {instructions.map((instruction, i) => {
        if (typeof instruction === "object") {
          return (
            <li>
              <ul key={i}>
                <li>
                  {editMode ? (
                    <input
                      type="text"
                      value={instruction.name}
                      onChange={(e) => onChangeInput(e, drill)}
                    />
                  ) : (
                    <span>{instruction.name}</span>
                  )}
                </li>
                <RenderInstructions
                  instructions={instruction.subElement}
                  drill={[...drill, i, "subElements"]}
                  onChangeInput={onChangeInput}
                  editMode={editMode}
                />
              </ul>
            </li>
          );
        }
        return (
          <li key={i} className={styles["grow-wrap"]}>
            {editMode ? (
              <textarea
                type="text"
                value={instruction}
                onChange={(e) => onChangeTextAreaInput(e, drill, i)}
                className="w-full resize-none"
              />
            ) : (
              <span>{instruction}</span>
            )}
          </li>
        );
      })}
    </ListType>
  );
};

const RenderIngredients = ({ ingredients, editMode, onChangeIngredients }) => (
  <ul>
    {ingredients.map((ingredient, i) => (
      <li key={i}>
        {editMode ? (
          <input
            type="text"
            value={ingredient}
            onChange={(e) => onChangeIngredients(e, i)}
            style={{ width: "100%" }}
          />
        ) : (
          <p>{ingredient}</p>
        )}
      </li>
    ))}
  </ul>
);

const Edit = ({ recipe }) => {
  const [parsedRecipe, setParsedRecipe] = useState(
    recipe ? JSON.parse(recipe) : null
  );
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setParsedRecipe(recipe ? JSON.parse(recipe) : null);
  }, [recipe]);

  if (!parsedRecipe) {
    return (
      <div className={styles.main}>
        <p>This recipe cannot be found :(</p>
      </div>
    );
  }

  const saveRecipe = async () => {
    if (loading) return;
    setLoading(true);
    if (authUser) {
      const userListSuccess = await checkForUserListOrCreate(authUser.uid);
      const addNew = await addUnsortedRecipe(authUser.uid, parsedRecipe);
      if (!addNew || !userListSuccess) {
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    } else if (typeof window !== "undefined") {
      alert("log in to save recipes!");
    }
    setLoading(false);
  };

  const EditContainer = editMode
    ? Form
    : ({ children, ...props }) => <div {...props}>{children}</div>;

  return (
    <Container className="pt-0">
      <EditContainer className="bg-white h-full p-8 rounded-xl w-full">
        <h1 className="w-full text-center">Result</h1>
        <div className="flex flex-row justify-between">
          <Button onClick={saveRecipe} squared gray>
            <Image src="/heart.svg" width="20" height="20" alt="heart Logo" />
            <span className="ml-1">Save Recipe</span>
          </Button>
          <Button
            onClick={() => {
              setEditMode(!editMode);
            }}
            squared
            gray
          >
            <Image src="/edit.svg" width="20" height="20" alt="edit Logo" />
            <span className="ml-1">
              {editMode ? "Exit Edit Mode" : "Edit Recipe"}
            </span>
          </Button>
        </div>
        <div
          className="w-full h-40 bg-cover bg-center mt-4 rounded-xl"
          style={{
            backgroundImage: `url(${
              typeof parsedRecipe.image === "string"
                ? parsedRecipe.image
                : Array.isArray(parsedRecipe.image)
                ? typeof parsedRecipe?.image?.[0] === "string"
                  ? parsedRecipe?.image?.[0]
                  : parsedRecipe?.image?.[0].url
                : parsedRecipe.image.url
            })`,
          }}
        ></div>
        {loading && <p>loading...</p>}
        <h2>Ingredients</h2>
        <RenderIngredients
          ingredients={parsedRecipe.ingredients}
          editMode={editMode}
          onChangeIngredients={(e, i) =>
            setParsedRecipe({
              ...parsedRecipe,
              ingredients: replaceAt(
                parsedRecipe.ingredients,
                i,
                e.target.value
              ),
            })
          }
        />
        <h2>Instructions</h2>
        <RenderInstructions
          instructions={parsedRecipe.instructions}
          drill={["instructions"]}
          onChangeInput={(e, drill) => {
            setParsedRecipe(
              drillAndReplace(
                parsedRecipe,
                [...drill, i, "name"],
                e.target.value
              )
            );
          }}
          onChangeTextAreaInput={(e, drill, i) => {
            setParsedRecipe(
              drillAndReplace(parsedRecipe, [...drill, i], e.target.value)
            );
          }}
          top
          editMode={editMode}
        />
      </EditContainer>
    </Container>
  );
};

export default Edit;

export async function getServerSideProps(context) {
  const recipes = await getRecipe(context.query.url);

  if (!recipes) return { props: {} };

  console.log("running");

  return {
    props: {
      recipe: JSON.stringify({ ...recipes, recipeURL: context.query.url }),
    },
  };
}
