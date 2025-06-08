//import "./style.css";
import typescriptLogo from "./typescript.svg";
import viteLogo from "/vite.svg";
import { Performe, useState } from "./performe";

const React = Performe;

const container = document.getElementById("app");

Performe.render(<Test/>, container);

Performe.render;


function Test() {
    const [count, setCount] = useState(0);

    return <div id="foo" onClick={() => setCount(c => c + 1)}>
        <b>
            <h1 style={{color: "red"}}>Performe + React</h1>
            <a href="#" style={{ backgroundColor: "red" }}>burger: {count}</a>
        </b>
    </div>
}


/* return Performe.createElement(
"div",
{ id: "foo" },
Performe.createElement(
    "b", 
    null, 
    Performe.createElement("a", null, "burger")
) */