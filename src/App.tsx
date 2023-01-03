import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/LoginPage';
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
            <Route path="/LoginPage" element={<LoginPage />} />
            <Route path="/RegisterPage" element={<RegisterPage />} />
            </Routes>
        </div>
        </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;