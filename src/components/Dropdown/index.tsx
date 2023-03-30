import React from 'react';
import { MenuItem, Menu, IconButton } from '@mui/material'
import { Link } from 'react-router-dom'
import FirebaseContext from '../../context/firebase'
import UserContext from '../../context/user'
import { useContext, useState } from 'react'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';

interface Props {
    links: Link[]; 
};

interface Link {
    title: string;
    url: string;
}

const Dropdown: React.FC<Props> = ({ links }) => {
    const { auth } = useContext(FirebaseContext);
    const { user } = useContext(UserContext);

    const [error, setError] = useState("");

    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSubmit = (e: any) => {
        setAnchorEl(null);

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
      <div>
        <IconButton
          size='large'
          aria-label='account of current user'
          aria-controls='menu-appbar'
          aria-haspopup='true'
          onClick={handleMenu}
          color='secondary'
        >
          <MenuIcon />
        </IconButton>
        <Menu
          id='menu-appbar'
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {links.map((link) =>
            link.title === 'Logout' ? (
              <MenuItem
                onClick={handleSubmit}
                component={Link}
                to={link.url}
                key={link.title}
              >
                {link.title}
              </MenuItem>
            ) : link.title === 'Profile' ? (
              <MenuItem
                onClick={handleClose}
                component={Link}
                to={link.url + `/${user.email}`}
                key={link.title}
              >
                {link.title}
              </MenuItem>
            ) : (
              <MenuItem
                onClick={handleClose}
                component={Link}
                to={link.url}
                key={link.title}
              >
                {link.title}
              </MenuItem>
            )
          )}
        </Menu>
      </div>
    )
};

export default Dropdown;