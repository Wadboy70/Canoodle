import { RecipeContext } from "lib/recipeContext";
import { SelectContext } from "lib/selectContext";
import Link from "next/link";
import { useContext } from "react";

const RecipePreview = ({ recipe, listId }) => {
  const { hydrateRecipes, setHydrateRecipes } = useContext(RecipeContext);
  const { select, editMode } = useContext(SelectContext);

  if (!recipe) return null;

  const LinkContainer = editMode ? ({ children }) => <>{children}</> : Link;
  return (
    <>
      <LinkContainer href={`/view/${recipe.id}`}>
        <a
          className={`border-black rounded-xl border-solid border border-0 overflow-hidden m-2 bg-white shadow-xl flex flex-col aspect-square`}
        >
          {editMode && (
            <div className="form-check absolute">
              <input
                className="form-check-input appearance-none h-4 w-4 border border-slate-300 rounded-full p-4 bg-slate-300 checked:bg-green-500 checked:border-green-500 focus:outline-none transition duration-200 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer -translate-x-4 -translate-y-2"
                type="checkbox"
                id="flexCheckChecked"
                onChange={handleChange}
                checked={!!select.find((v) => v === recipe.id)}
              />
            </div>
          )}
          {recipe.image && (
            <div
              className="w-full bg-cover grow bg-center"
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
          <div className="leading-10 mx-3 flex">
            <h3 className="truncate w-4/5 grow">{recipe.name}</h3>
            {editMode && (
              <button
                className="focus:outline-none align-top cursor-pointer text-red-500 align-self-end ml-1"
                type="checkbox"
                id="flexCheckChecked"
                onClick={async (e) => {
                  e.stopPropagation();
                  await removeRecipeFromList(recipe.id, listId);
                  setHydrateRecipes(hydrateRecipes + 1);
                }}
              >
                ✖
              </button>
            )}
          </div>
        </a>
      </LinkContainer>
    </>
  );
};

export default RecipePreview;
