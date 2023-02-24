import React from 'react';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import Logo from "../../images/logos/logo.png"
import FirebaseContext from "../../context/firebase";
import UserContext from "../../context/user";
import { useContext, useState } from "react";
import { signOut } from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";

// interface Props {
//     logout: () => void;
//     isAuthenticated: boolean;
// };
// commenting because we need to implement logout logic later

interface Props {
    isAuthenticated: boolean;
};

const authLinks = (handleSubmit: any, error: any) => (
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
            component={Link} to='/profile'>
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
);

const guestLinks = (
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
                <Link to="/" style={{ display: 'flex', alignContent: 'center' }}>
                    <img src={Logo} alt="Finberry Logo" style={{ flexGrow: 1 }} />
                </Link>
                {isAuthenticated ? authLinks(handleSumbit, error) : guestLinks}
            </Toolbar>
        </AppBar>
    );
};

export default Header;