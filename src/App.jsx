import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useLayoutEffect } from "react";
import HomePage from "./containers/HomePage";
import LoginPage from "./containers/LoginPage";
import RegisterPage from "./containers/RegisterPage";
import ArticlePage from "./containers/ArticlePage";
import PasswordResetPage from "./containers/PasswordResetPage";
import ProfilePage from "./containers/ProfilePage";
import SimulatorPortfolioPage from "./containers/SimulatorPortfolioPage";
import GamePortfolioPage from "./containers/GamePortfolioPage";
import LeaderboardsPage from "./containers/LeaderboardsPage";
import CoachPortalPage from "./containers/CoachPortalPage";
import CoachCataloguePage from "./containers/CoachCataloguePage";
import CoachRegistrationPage from "./containers/CoachRegistrationPage";
import FaqPage from "./containers/FaqPage";
import ContactPage from "./containers/ContactPage";
import AboutPage from "./containers/AboutPage";
import NotFoundPage from "./containers/NotFoundPage";
import useAuthListener from "./hooks/use-auth";
import ArticlesPage from "./containers/ArticlesPage";
import BuyPremiumPage from "./containers/BuyPremiumPage";
import UserContext from "./context/user";
import {
  createTheme,
  ThemeProvider,
  responsiveFontSizes,
} from "@mui/material/styles";

import Header from "./components/Header";
import Footer from "./components/Footer";

const theme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#6511F5",
      },
      secondary: {
        main: "#12ce60",
      },
      info: {
        main: "#F8F9FA",
        contrastText: "#212529",
      },
    },
    typography: {
      fontFamily: "Fredoka, Varela Round, Ubuntu, sans-serif",
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            color: "secondary",
            textTransform: "none",
            fontWeight: "bold",
          },
        },
      },
    },
  })
);

const ScrollToTop = ({ children }) => {
  const location = useLocation();
  useLayoutEffect(() => {
    document.documentElement.scrollTo(0, 0);
  }, [location.pathname]);
  return children;
};

function App() {
  const { user } = useAuthListener();
  return (
    <ThemeProvider theme={theme}>
      <UserContext.Provider value={{ user }}>
        <BrowserRouter>
          <div>
            <ScrollToTop>
              <Header isAuthenticated={user} />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/Login" element={<LoginPage />} />
                <Route path="/Register" element={<RegisterPage />} />
                <Route path="/PasswordReset" element={<PasswordResetPage />} />
                <Route path="/Article/:id" element={<ArticlePage />} />
                <Route path="/Articles" element={<ArticlesPage />} />
                <Route path="/Profile/:email" element={<ProfilePage />} />
                <Route
                  path="/SimulatorPortfolio"
                  element={<SimulatorPortfolioPage />}
                />
                <Route path="/GamePortfolio" element={<GamePortfolioPage />} />
                <Route path="/Leaderboards" element={<LeaderboardsPage />} />
                <Route path="/CoachPortal/:email" element={<CoachPortalPage />} />
                <Route
                  path="/CoachCatalogue"
                  element={<CoachCataloguePage />}
                />
                <Route path="/CoachRegistration" element={<CoachRegistrationPage />} />
                <Route path="/BuyPremium" element={<BuyPremiumPage />} />
                <Route path="/FAQ" element={<FaqPage />} />
                <Route path="/Contact" element={<ContactPage />} />
                <Route path="/About" element={<AboutPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ScrollToTop>
            <Footer isAuthenticated={user} />
          </div>
        </BrowserRouter>
      </UserContext.Provider>
    </ThemeProvider>
  );
}

export default App;
