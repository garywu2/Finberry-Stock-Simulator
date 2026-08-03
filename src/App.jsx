import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useLayoutEffect } from 'react';
import HomePage from './containers/HomePage';
import LoginPage from './containers/LoginPage';
import RegisterPage from './containers/RegisterPage';
import ArticlePage from './containers/ArticlePage';
import PasswordResetPage from './containers/PasswordResetPage';
import ProfilePage from './containers/ProfilePage';
import SimulatorPortfolioPage from './containers/SimulatorPortfolioPage';
import GamePortfolioPage from './containers/GamePortfolioPage';
import LeaderboardsPage from './containers/LeaderboardsPage';
import CoachPortalPage from './containers/CoachPortalPage';
import CoachCataloguePage from './containers/CoachCataloguePage';
import CoachRegistrationPage from './containers/CoachRegistrationPage';
import FaqPage from './containers/FaqPage';
import ContactPage from './containers/ContactPage';
import AboutPage from './containers/AboutPage';
import NotFoundPage from './containers/NotFoundPage';
import useAuthListener from './hooks/use-auth';
import ArticlesPage from './containers/ArticlesPage';
import BuyPremiumPage from './containers/BuyPremiumPage';
import PreviewPage from './containers/PreviewPage';
import ProtectedRoute from './components/ProtectedRoute';
import UserContext from './context/user';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';

import Header from './components/Header';
import Footer from './components/Footer';

// Routes that have been migrated to the Berry Bright design and render their own
// chrome (brand TopNav/Footer). The legacy MUI Header/Footer are suppressed on
// these so the two chrome systems don't stack. Add routes here as pages migrate.
const REDESIGNED_ROUTES = ['/', '/Preview', '/SimulatorPortfolio'];

function Shell({ user }) {
  const location = useLocation();
  useLayoutEffect(() => {
    document.documentElement.scrollTo(0, 0);
  }, [location.pathname]);

  const hideLegacyChrome = REDESIGNED_ROUTES.includes(location.pathname);

  return (
    <div>
      {!hideLegacyChrome && <Header isAuthenticated={user} />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Login" element={<LoginPage />} />
        <Route path="/Register" element={<RegisterPage />} />
        <Route path="/PasswordReset" element={<PasswordResetPage />} />
        <Route path="/Article/:id" element={<ArticlePage />} />
        <Route path="/Articles" element={<ArticlesPage />} />
        <Route path="/Preview" element={<PreviewPage />} />
        <Route
          path="/Profile/:email"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/SimulatorPortfolio"
          element={
            <ProtectedRoute>
              <SimulatorPortfolioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/GamePortfolio"
          element={
            <ProtectedRoute>
              <GamePortfolioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Leaderboards"
          element={
            <ProtectedRoute>
              <LeaderboardsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/CoachPortal/:email"
          element={
            <ProtectedRoute>
              <CoachPortalPage />
            </ProtectedRoute>
          }
        />
        <Route path="/CoachCatalogue" element={<CoachCataloguePage />} />
        <Route
          path="/CoachRegistration"
          element={
            <ProtectedRoute>
              <CoachRegistrationPage />
            </ProtectedRoute>
          }
        />
        <Route path="/BuyPremium" element={<BuyPremiumPage />} />
        <Route path="/FAQ" element={<FaqPage />} />
        <Route path="/Contact" element={<ContactPage />} />
        <Route path="/About" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {!hideLegacyChrome && <Footer isAuthenticated={user} />}
    </div>
  );
}

function App() {
  const { user } = useAuthListener();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserContext.Provider value={{ user }}>
        <BrowserRouter>
          <Shell user={user} />
        </BrowserRouter>
      </UserContext.Provider>
    </ThemeProvider>
  );
}

export default App;
