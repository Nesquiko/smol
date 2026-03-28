import { render } from "solid-js/web";
import "solid-devtools";
// eslint-disable-next-line no-restricted-imports
import { name, version } from "../package.json";
// eslint-disable-next-line no-restricted-imports
import App from "./App";

console.log(`Running ${name} v${version}`);

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(() => <App />, root!);
