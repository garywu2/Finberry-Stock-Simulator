import React from 'react';
import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

// interface Props {
//     logout: () => void;
//     isAuthenticated: boolean;
// };
// commenting because we need to implement logout logic later

interface Props {
    isAuthenticated: boolean;
};

const authLinks = (
    <div>
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
    </div>
);

const guestLinks = (
    <div>
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
    </div>
);

const Header: React.FC<Props> = ({ isAuthenticated }) => {
    return (
        <AppBar position="static" color="inherit">
            <Toolbar>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                    <Link to="/" style={{ color: 'primary.main', textDecoration: 'none' }}>Logo Placeholder</Link>
                </Typography>
                {isAuthenticated ? authLinks : guestLinks }
            </Toolbar>
        </AppBar>
    );
};

export default Header;