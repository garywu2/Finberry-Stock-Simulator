import ReactDOM from "react-dom/client";
import App from "./App";
import FirebaseContext from "./context/firebase";
import { auth } from "./lib/firebase";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <FirebaseContext.Provider value={{ auth }}>
    <App />
  </FirebaseContext.Provider>
);

