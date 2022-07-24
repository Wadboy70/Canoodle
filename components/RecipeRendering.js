import { memo } from "react";
import Textarea from "react-expanding-textarea";
import styles from "styles/Edit.module.css";

const Instruction = ({ id, name, editMode, onChangeInstruction }) => {
  return (
    <li key={id} className={styles.instruction}>
      {editMode ? (
        <Textarea
          defaultValue={name}
          className={styles.textArea}
          onChange={(e) => {
            onChangeInstruction({
              id,
              name: e.target.value,
            });
          }}
        />
      ) : (
        <span>{name}</span>
      )}
    </li>
  );
};

const MemoizedInstruction = memo(
  Instruction,
  (prev, next) => prev.name === next.name
);

export const RenderInstructions = ({
  instructions = [],
  editMode = false,
  onChangeInstruction = () => {},
}) => {
  return (
    <ol>
      {instructions.map((instruction) => {
        return (
          <MemoizedInstruction
            id={instruction.id}
            key={instruction.id}
            name={instruction.name}
            onChangeInstruction={onChangeInstruction}
            editMode={editMode}
          />
        );
      })}
    </ol>
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
