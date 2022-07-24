import Textarea from "react-expanding-textarea";
import styles from "styles/Edit.module.css";

const ListType = ({ top, children }) =>
  top ? <ol>{children}</ol> : <ul>{children}</ul>;

export const RenderInstructions = ({
  instructions = [],
  editMode = false,
  top = false,
  level = 0,
  onChangeInstruction = () => {},
}) => {
  const levelArrs = [];
  let currIndex = 0;

  instructions.forEach((instruction, i) => {
    if ((instruction.level === level || i === instructions.length - 1) && i) {
      levelArrs.push(instructions.slice(currIndex, i + 1));
      currIndex = i;
    }
  });
  if (!levelArrs.length) {
    return null;
  }

  return (
    <ListType top={top}>
      {levelArrs.map((levelArr, i) => {
        const newLevel = levelArr.slice(1);
        const levelInstruction = levelArr[0];
        return (
          <li key={levelInstruction.id} className={styles.instruction}>
            {editMode ? (
              <Textarea
                defaultValue={levelInstruction.name}
                className={styles.textArea}
                onChange={(e) =>
                  onChangeInstruction({
                    ...levelInstruction,
                    name: e.target.value,
                  })
                }
              />
            ) : (
              <span>{levelInstruction.name}</span>
            )}
            {newLevel.length !== 0 && (
              <RenderInstructions
                instructions={newLevel}
                level={level + 1}
                top={false}
                editMode={editMode}
                onChangeInstruction={onChangeInstruction}
              />
            )}
          </li>
        );
      })}
    </ListType>
  );
};

export const RenderIngredients = ({
  ingredients,
  editMode,
  onChangeIngredients,
}) => (
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
