import { v4 } from "uuid";
import WAE from "web-auto-extractor";
import { isValidHttpUrl } from "./helperFunctions";
import he from "he";

const getRecipe = async (url) => {
  if (!isValidHttpUrl(url)) return null;

  const html = await fetch(url, { mode: "cors" }).then((x) => x.text());

  const wae = WAE().parse(html);

  try {
    if (wae.jsonld.Recipe && wae.jsonld.Recipe.length) {
      const recipe = wae.jsonld.Recipe[0];
      return {
        name: recipe.name || "recipe",
        image: recipe.image || "",
        ingredients: recipe.recipeIngredient || [],
        instructions: parseInstructions(recipe.recipeInstructions) || [],
      };
    } else if (
      wae.jsonld["undefined"][0]?.["@graph"]?.find(
        (val) => val["@type"] === "Recipe"
      )
    ) {
      const recipe = wae.jsonld["undefined"][0]["@graph"].find(
        (val) => val["@type"] === "Recipe"
      );
      return {
        name: recipe.name || "recipe",
        image: Array.isArray(recipe.image)
          ? recipe.image[0]
          : recipe.image || "",
        ingredients: recipe.recipeIngredient || [],
        instructions: parseInstructions(recipe.recipeInstructions) || [],
      };
    }
  } catch (error) {
    console.log(error);
    return null;
  }

  return null;
};

const parseInstructions = (instructions, level = 0) => {
  if (!instructions) return [];

  return instructions.reduce((arr, instruction) => {
    if (typeof instruction === "string")
      return arr.concat({ name: instruction, level, id: v4() });
    if (typeof instruction === "object") {
      if (instruction.hasOwnProperty("itemListElement")) {
        // for embedded lists
        return arr.concat([
          {
            name: he.decode(instruction.name || instruction.text || ""),
            level,
            id: v4(),
          },
          ...parseInstructions(instruction.itemListElement, level + 1),
        ]);
      } else {
        return arr.concat({
          name: he.decode(instruction.name || instruction.text || ""),
          level,
          id: v4(),
        });
      }
    }
  }, []);
};

export default getRecipe;
