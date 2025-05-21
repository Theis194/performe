import "./style.css";
import typescriptLogo from "./typescript.svg";
import viteLogo from "/vite.svg";
import { Performe } from "./performe";

const element = Performe.createElement(
    "div",
    { id: "foo" },
    Performe.createElement("a", null, "burger"),
    Performe.createElement("b")
);
const container = document.getElementById("app");

Performe.render(element, container);

Performe.render;

//setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);
