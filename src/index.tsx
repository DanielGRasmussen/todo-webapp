import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<header></header>
		<App />
		<footer></footer>
	</React.StrictMode>
);

// Pass a function to log results (for example: reportWebVitals(console.log))
reportWebVitals();
