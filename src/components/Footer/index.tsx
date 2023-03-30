import React from 'react';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import FirebaseContext from "../../context/firebase";
import UserContext from "../../context/user";
import { useContext, useState } from "react";

interface Link {
    url: string;
    name: string;
}
interface Props {
    isAuthenticated: boolean;
};


const linksAuth: Link[] = [
    { url: '/about', name: 'About Us' },
    { url: '/faq', name: 'FAQ' },
    { url: '/contact', name: 'Contact Us' },
    { url: '/BuyPremium', name: 'Memberships'}
];

const links: Link[] = [
    { url: '/about', name: 'About Us' },
    { url: '/faq', name: 'FAQ' },
    { url: '/contact', name: 'Contact Us' },
];

const Footer: React.FC<Props> = ({ isAuthenticated }) => {
    const { auth } = useContext(FirebaseContext);
    const { user } = useContext(UserContext); 
    return (
      <AppBar
        position='static'
        color='inherit'
        sx={{ top: 'auto', bottom: 0, boxShadow: 'none', display: "flex" }}
      >
         {isAuthenticated ? (
        <Toolbar sx={{justifyContent: { xs: 'center', lg: 'left'}}}>
          {linksAuth.map((link) => (
            <Button
              size='small'
              sx={{
                color: 'primary.main',
                marginLeft: '1rem',
              }}
              component={Link}
              to={link.url}
              key={link.name}
            >
              {link.name}
            </Button>
          ))}
        </Toolbar>
         ) : (
        <Toolbar sx={{justifyContent: { xs: 'center', lg: 'left'}}}>
          {links.map((link) => (
            <Button
              size='small'
              sx={{
                color: 'primary.main',
                marginLeft: '1rem',
              }}
              component={Link}
              to={link.url}
              key={link.name}
            >
              {link.name}
            </Button>
          ))}
        </Toolbar>
         )}
      </AppBar>
    )
};

export default Footer;