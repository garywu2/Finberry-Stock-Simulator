import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from './containers/HomePage';
import LoginPage from './containers/LoginPage';
import RegisterPage from './containers/RegisterPage';
import ArticlesPage from './containers/ArticlesPage';
import ProfilePage from './containers/ProfilePage';
import SimulatorPortfolioPage from './containers/SimulatorPortfolioPage';
import GamePortfolioPage from './containers/GamePortfolioPage';
import LeaderboardsPage from './containers/LeaderboardsPage';
import CoachPortalPage from './containers/CoachPortalPage';
import CoachCataloguePage from './containers/CoachCataloguePage';
import FaqPage from './containers/FaqPage';
import ContactPage from './containers/ContactPage';

import useAuthListener from "./hooks/use-auth";
import UserContext from "./context/user";
import { createTheme, ThemeProvider } from '@mui/material/styles';

import Header from './components/Header'
import Footer from './components/Footer'

const theme = createTheme({
  palette: {
    mode: 'light',
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
  typography: {
    // fontFamily: 'Source Sans Pro', commented for now
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          color: "secondary",
          textTransform: 'none',
        }
      }
    },
  }
});

function App() {
  const { user } = useAuthListener();
  return (
    <ThemeProvider theme={theme}>
      <UserContext.Provider value={{ user }}>
        <BrowserRouter>
          <div>
            <Header isAuthenticated={user} />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/Login" element={<LoginPage />} />
              <Route path="/Register" element={<RegisterPage />} />
              <Route path="/Articles" element={<ArticlesPage />} />
              <Route path="/Profile" element={<ProfilePage />} />
              <Route path="/SimulatorPortfolio" element={<SimulatorPortfolioPage />} />
              <Route path="/GamePortfolio" element={<GamePortfolioPage />} />
              <Route path="/Leaderboards" element={<LeaderboardsPage />} />
              <Route path="/CoachPortal" element={<CoachPortalPage />} />
              <Route path="/CoachCatalogue" element={<CoachCataloguePage />} />
              <Route path="/FAQ" element={<FaqPage />} />
              <Route path="/Contact" element={<ContactPage />} />
              
            </Routes>
            <Footer />
          </div>
        </BrowserRouter>
      </UserContext.Provider>
    </ThemeProvider>
  );
}

export default App;