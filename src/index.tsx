import ReactDOM from "react-dom/client";
import App from "./App";
import FirebaseContext from "./context/firebase";
import { auth } from "./lib/firebase";
import { CssBaseline } from "@mui/material";


//Have to add redux here for state 
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <ApiProvider api={apiSlice}>
    <Provider store={store}></Provider>
      <FirebaseContext.Provider value={{ auth }}>
        <CssBaseline />
        <App />
       </FirebaseContext.Provider>
    </Provider>
  </ApiProvider>
);

