// src/setupTests.js
import "@testing-library/jest-dom";
beforeAll(() => {
  Object.defineProperty(window, "localStorage", {
    value: (() => {
      let store = {};
      return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
          store[key] = value.toString();
        },
        removeItem: (key) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        },
      };
    })(),
    writable: true,
  });
});
