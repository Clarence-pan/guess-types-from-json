import React, { useState, useEffect, useCallback } from "react";
import "./styles.css";

export default function App() {
  const [isIoTsStyle, setIsIoTsStyle] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [types, setTypes] = useState(null);
  const [error, setError] = useState(null);
  const transformToTypes = useCallback(() => {
    if (inputValue) {
      try {
        // eslint-disable-next-line
        const jsonValue = eval(`(${inputValue})`);
        setTypes(guessTypesFromJsonValue(jsonValue, 0, { isIoTsStyle }));
        setError(null);
      } catch (e) {
        console.error("Got error: ", e);
        setError(e);
      }
    }
  }, [inputValue, isIoTsStyle]);

  useEffect(() => {
    transformToTypes();
  }, [transformToTypes]);

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
      <label>
        <input
          type="checkbox"
          checked={isIoTsStyle}
          onChange={e => {
            setIsIoTsStyle(e.target.checked);
          }}
        />
        io-ts style
      </label>
      {!!error && <div className="errors">{`${error}`}</div>}
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

function guessTypesFromJsonValue(data, indent = 0, options = {}) {
  if (data === null) {
    return options.isIoTsStyle ? "t.optionalString" : "string | null";
  }

  if (typeof data === "object") {
    if (Array.isArray(data)) {
      if (options.isIoTsStyle) {
        return `t.optionalArray(${guessTypesFromJsonValue(
          data[0],
          indent + 1,
          options
        )})`;
      }
      return `Array<${guessTypesFromJsonValue(data[0], indent + 1, options)}>`;
    } else {
      const objectTypes = [
        "{",
        ...Object.entries(data).map(
          ([k, v]) =>
            `${indentBySpace(indent + 1)}${k}: ${guessTypesFromJsonValue(
              v,
              indent + 1,
              { ...options, typeName: k.replace(/^./, f => f.toUpperCase()) }
            )},`
        ),
        indentBySpace(indent) + "}"
      ].join("\n");

      return options.isIoTsStyle
        ? options.typeName
          ? `t.optionalType(${objectTypes}, "${options.typeName}")`
          : `t.optionalType(${objectTypes})`
        : objectTypes;
    }
  }

  return options.isIoTsStyle
    ? `t.optional${ucfirst(typeof data)}`
    : typeof data;
}

function indentBySpace(indent) {
  return new Array((+indent || 0) * 2).fill(" ").join("");
}

function ucfirst(s) {
  return s.replace(/^./, f => f.toUpperCase());
}
