import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from './components/HomePage';
import useAuthListener from "./hooks/use-auth";
import UserContext from "./context/user";

function App() {
    const { user } = useAuthListener();
  return (
    <UserContext.Provider value={{ user }}>
        <BrowserRouter>
        <div>
            <Routes>
            <Route path="/" element={<HomePage />} />
            </Routes>
        </div>
        </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;