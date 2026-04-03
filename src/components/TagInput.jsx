import { useState } from "react";

export default function TagInput({ tags, onAdd, onRemove }) {
  const [value, setValue] = useState("");

  return (
    <div className="tags-input-wrap">
      {tags.map((tag) => (
        <span key={tag} className="tag-chip">
          {tag}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRemove(tag);
            }}
          >
            x
          </button>
        </span>
      ))}
      <input
        className="tags-text-input"
        value={value}
        placeholder="Add technique..."
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            onAdd(value);
            setValue("");
          }
          if (event.key === "Backspace" && !value && tags.length) {
            onRemove(tags[tags.length - 1]);
          }
        }}
      />
    </div>
  );
}
