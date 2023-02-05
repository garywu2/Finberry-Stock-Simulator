import React from 'react';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import Logo from "../../images/logos/logo.png"

// interface Props {
//     logout: () => void;
//     isAuthenticated: boolean;
// };
// commenting because we need to implement logout logic later

interface Props {
    isAuthenticated: boolean;
};

const authLinks = (
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
            component={Link} to='/profile'>
            Profile
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
            component={Link} to='/dashboard'>
            Dashboard
        </Button>
        {/* // this logout button will be a function that modifies the user state. logout will be passed in as a prop */}
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
            component={Link} to='/logout'>
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
    return (
        <AppBar position="static" color="inherit">
            <Toolbar>
                <Link to="/" style={{ display: 'flex', alignContent: 'center' }}>
                    <img src={Logo} alt="Finberry Logo" style={{ flexGrow: 1 }} />
                </Link>
                {isAuthenticated ? authLinks : guestLinks}
            </Toolbar>
        </AppBar>
    );
};

export default Header;