import React from 'react'
import { MenuItem, Menu, IconButton, Typography, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import FirebaseContext from '../../context/firebase'
import UserContext from '../../context/user'
import { useContext, useState } from 'react'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircle from '@mui/icons-material/AccountCircle'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

interface Props {
  links: Link[]
}

interface Link {
  title: string
  url: string
}

const LinkDropdown: React.FC<Props> = ({ links }) => {
  const { auth } = useContext(FirebaseContext)
  const { user } = useContext(UserContext)

  const [error, setError] = useState('')

  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <div>
      <Button
        size='small'
        sx={{
          backgroundColor: 'secondary.main',
          color: 'white',
          marginLeft: '1rem',
          '&:hover': {
            backgroundColor: 'secondary.dark',
          },
        }}
        onClick={handleMenu}
        color='secondary'
        endIcon={<ArrowDropDownIcon />}
      >
        Coaching
      </Button>
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
        {links.map((link) => (
          <MenuItem
            onClick={handleClose}
            component={Link}
            to={link.url}
            key={link.title}
          >
            {link.title}
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}

export default LinkDropdown
