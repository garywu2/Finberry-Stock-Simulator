import React from 'react';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

interface Link {
    url: string;
    name: string;
}

const links: Link[] = [
    { url: '/about', name: 'About Us' },
    { url: '/article', name: 'Articles' },
    { url: '/faq', name: 'FAQ' },
    { url: '/contact', name: 'Contact Us' },
];

const Footer = () => {
    return (
      <AppBar
        position='static'
        color='inherit'
        sx={{ top: 'auto', bottom: 0, boxShadow: 'none' }}
      >
        <Toolbar>
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
      </AppBar>
    )
};

export default Footer;