import React from 'react';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import Logo from "../../images/logos/logo.svg"
import BerryLogo from "../../images/logos/berry-logo.svg"
import FirebaseContext from "../../context/firebase";
import UserContext from "../../context/user";
import { useContext, useState } from "react";
import { signOut } from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";
import Dropdown from '../Dropdown';

interface Props {
    isAuthenticated: boolean;
};

const links = [{ title: 'Profile', url: '/profile' }, { title: 'Simulator', url: '/SimulatorPortfolio' }, { title: 'Coach Catalogue', url: '/CoachCatalogue' }, { title: 'Coach Portal', url: '/CoachPortal' }, { title: 'Coach Registration', url: '/CoachRegistration' }, { title: 'Logout', url: '/logout' }];
const links2 = [{ title: 'Login', url: '/login' }, { title: 'Register', url: '/register' }];

const authLinks = (handleSubmit: any, error: any, email: String) => (
    <>
        <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, justifyContent: 'flex-end' }}>
            {error && <Typography color='red'>{error}</Typography>}
            <Button
                size='small'
                sx={{
                    backgroundColor: "secondary.main",
                    color: "white",
                    marginLeft: "1rem",
                    '&:hover': {
                        backgroundColor: 'secondary.dark',
                    }
                }}
                component={Link} to={'/profile/' + email }>
                Profile
            </Button>
            {error && <Typography color='red'>{error}</Typography>}
            <Button
                size='small'
                sx={{
                    backgroundColor: "secondary.main",
                    color: "white",
                    marginLeft: "1rem",
                    '&:hover': {
                        backgroundColor: 'secondary.dark',
                    }
                }}
                component={Link} to='/SimulatorPortfolio'>
                Simulator
            </Button>
            <Button
                size='small'
                sx={{
                    backgroundColor: "secondary.main",
                    color: "white",
                    marginLeft: "1rem",
                    '&:hover': {
                        backgroundColor: 'secondary.dark',
                    }
                }}
                component={Link} to='/CoachCatalogue'>
                Coach Catalogue
            </Button>
            <Button
                size='small'
                sx={{
                    backgroundColor: "secondary.main",
                    color: "white",
                    marginLeft: "1rem",
                    '&:hover': {
                        backgroundColor: 'secondary.dark',
                    }
                }}
                component={Link} to={'/CoachPortal/' + email}>
                Coach Portal
            </Button>
            <Button
                size='small'
                sx={{
                    backgroundColor: "secondary.main",
                    color: "white",
                    marginLeft: "1rem",
                    '&:hover': {
                        backgroundColor: 'secondary.dark',
                    }
                }}
                component={Link} to='/CoachRegistration'>
                Coach Registration
            </Button>
            {error && <Typography color='red'>{error}</Typography>}
            <Button
                size='small'
                sx={{
                    backgroundColor: "secondary.main",
                    color: "white",
                    marginLeft: "1rem",
                    '&:hover': {
                        backgroundColor: 'secondary.dark',
                    }
                }}
                onClick={handleSubmit}
            >
                Logout
            </Button>
        </Box>
        <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" }, justifyContent: 'flex-end' }}>
            <Dropdown links={links} />
        </Box>
    </>
);

const guestLinks = (
    <>
        <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, justifyContent: 'flex-end' }}>
            <Button
                size='small'
                sx={{
                    backgroundColor: "secondary.main",
                    color: "white",
                    marginLeft: "1rem",
                    '&:hover': {
                        backgroundColor: 'secondary.dark',
                    }
                }}
                component={Link} to='/login'>
                Login
            </Button>
            <Button
                size='small'
                sx={{
                    backgroundColor: "secondary.main",
                    color: "white",
                    marginLeft: "1rem",
                    '&:hover': {
                        backgroundColor: 'secondary.dark',
                    }
                }}
                component={Link} to='/register'>
                Register
            </Button>
        </Box>
        <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" }, justifyContent: 'flex-end' }}>
            <Dropdown links={links2} />
        </Box>
    </>
);

const Header: React.FC<Props> = ({ isAuthenticated }) => {
    const { auth } = useContext(FirebaseContext);
    const { user } = useContext(UserContext); 

    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleSumbit = (e: any) => {
        signOut(auth)
            .then((servResult: any) => {
                console.log(servResult);
                setError("");
                navigate("/");
            })
            .catch((e: any) => {
                setError(e.response.data.msg);
            });
    };

    return (
        <AppBar position="fixed" color="inherit">
            <Toolbar>
                <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                    <Link to="/" style={{ height: '2.5rem', alignContent: 'center' }}>
                        <img src={Logo} alt="Finberry Logo" style={{ flexGrow: 1, height: '100%' }} />
                    </Link>
                </Box>
                <Box sx={{ display: { xs: "flex", md: "none" }}}>
                    <Link to="/" style={{ height: '2.5rem', alignContent: 'center' }}>
                        <img src={BerryLogo} alt="Finberry Logo" style={{ flexGrow: 1, height: '100%' }} />
                    </Link>
                </Box>
                {isAuthenticated ? authLinks(handleSumbit, error, user.email) : guestLinks}
            </Toolbar>
        </AppBar>
    );
};

export default Header;