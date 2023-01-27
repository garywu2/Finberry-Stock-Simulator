import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from './containers/HomePage';
import LoginPage from './containers/LoginPage';
import RegisterPage from './containers/RegisterPage';
import ArticlesPage from './containers/ArticlesPage';
import useAuthListener from "./hooks/use-auth";
import UserContext from "./context/user";

import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#7e57c2',
    },
    secondary: {
      main: '#00897b',
    },
    info: {
      main: '#F8F9FA',
      contrastText: '#212529'
    }
  },
});

function App() {
    const { user } = useAuthListener();
  return (
    <ThemeProvider theme={theme}>
      <UserContext.Provider value={{ user }}>
          <BrowserRouter>
          <div>
              <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/Login" element={<LoginPage />} />
              <Route path="/Register" element={<RegisterPage />} />
              <Route path="/Articles" element={<ArticlesPage />} />
              </Routes>
          </div>
          </BrowserRouter>
      </UserContext.Provider>
    </ThemeProvider>
  );
}

export default App;