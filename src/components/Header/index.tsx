import React from 'react';
import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

interface Props {
    title: string;
    links: { label: string; path: string }[];
}

const Header: React.FC<Props> = ({ title, links }) => {
    return (
        <AppBar position="static" color="inherit">
            <Toolbar>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                    <Link to="/" style={{ color: 'primary.main', textDecoration: 'none' }}>{title}</Link>
                </Typography>
                {links.map((link) => (
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
                        component={Link} to={link.path}>
                        {link.label}
                    </Button>
                ))}
            </Toolbar>
        </AppBar>
    );
};

export default Header;