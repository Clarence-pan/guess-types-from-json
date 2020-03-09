import React, { useState } from "react";
import "./styles.css";

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const [types, setTypes] = useState(null);
  const transformToTypes = () => {
    try {
      // eslint-disable-next-line
      const jsonValue = eval(`(${inputValue})`);
      setTypes(guessTypesFromJsonValue(jsonValue));
    } catch (e) {
      console.error("Got error: ", e);
      window.alert(`${e}`);
    }
  };

  console.log(types);

  return (
    <div className="App">
      <textarea
        placeholder="input your json"
        value={inputValue}
        onInput={e => {
          setInputValue(e.target.value);
        }}
      />
      <button type="button" onClick={transformToTypes}>
        guess types
      </button>
      {!!types && (
        <div className="types-wrap">
          <h3>Types </h3>
          <pre className="types">
            <code>type Foo = {types}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

function guessTypesFromJsonValue(data, indent = 0) {
  if (data === null) {
    return "null";
  }

  if (typeof data === "object") {
    if (Array.isArray(data)) {
      return `Array<${guessTypesFromJsonValue(data[0], indent + 1)}>`;
    } else {
      return [
        "{",
        ...Object.entries(data).map(
          ([k, v]) =>
            `${indentBySpace(indent + 1)}${k}: ${guessTypesFromJsonValue(
              v,
              indent + 1
            )},`
        ),
        indentBySpace(indent) + "}"
      ].join("\n");
    }
  }

  return typeof data;
}

function indentBySpace(indent) {
  return new Array((+indent || 0) * 2).fill(" ").join("");
}