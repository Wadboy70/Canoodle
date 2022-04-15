import WAE from "web-auto-extractor";
import { isValidHttpUrl } from "./helperFunctions";

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
      wae.jsonld["undefined"][0]?.["@graph"] &&
      wae.jsonld["undefined"][0]?.["@graph"].find(
        (val) => val["@type"] === "Recipe"
      )
    ) {
      const recipe = wae.jsonld["undefined"][0]["@graph"].find(
        (val) => val["@type"] === "Recipe"
      );
      return {
        name: recipe.name || "recipe",
        image: recipe.image || "",
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

const parseInstructions = (instructions) => {
  if (!instructions) return [];

  return instructions.map((instruction) => {
    if (typeof instruction === "string") return instruction;
    else if (typeof instruction === "object") {
      if (instruction.hasOwnProperty("itemListElement")) {
        // for embedded lists
        return {
          name: instruction.name || instructions.text || "",
          subElements: parseInstructions(instruction.itemListElement),
        };
      } else return instruction.text || instruction.name || "";
    }
  });
};

export default getRecipe;
