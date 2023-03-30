import React from 'react';
import {
  AppBar,
  Box,
  Button,
  ButtonGroup,
  Toolbar,
  Typography,
} from '@mui/material'
import { Link } from 'react-router-dom'
import Logo from '../../images/logos/logo.svg'
import BerryLogo from '../../images/logos/berry-logo.svg'
import FirebaseContext from '../../context/firebase'
import UserContext from '../../context/user'
import { useContext, useState } from 'react'
import { signOut } from 'firebase/auth'
import { Navigate, useNavigate } from 'react-router-dom'
import Dropdown from '../Dropdown'
import LinkDropdown from '../LinkDropdown'

interface Props {
  isAuthenticated: boolean
}

const links = [
  { title: 'Profile', url: '/profile' },
  { title: 'Simulator', url: '/SimulatorPortfolio' },
  { title: 'Leaderboards', url: '/Leaderboards' },
  { title: 'Articles', url: '/articles' },
  { title: 'Logout', url: '/logout' },
]
const links2 = [
  { title: 'Login', url: '/login' },
  { title: 'Register', url: '/register' },
  { title: 'Articles', url: '/articles' },
]

const links3 = (user: any) => [
  { title: 'Coach Catalogue', url: '/CoachCatalogue' },
  { title: 'Coach Portal', url: `/CoachPortal/${user.email}` },
  { title: 'Coach Registration', url: '/CoachRegistration' },
]

const authLinks = (handleSubmit: any, error: any, user: any) => (
  <>
    <Box
      sx={{
        flexGrow: 1,
        display: { xs: 'none', md: 'flex' },
        justifyContent: 'flex-end',
      }}
    >
      {error && <Typography color='red'>{error}</Typography>}
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
        component={Link}
        to={'/profile/' + user.email}
      >
        Profile
      </Button>
      {error && <Typography color='red'>{error}</Typography>}
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
        component={Link}
        to='/SimulatorPortfolio'
      >
        Simulator
      </Button>
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
        component={Link}
        to='/Leaderboards'
      >
        Leaderboards
      </Button>
      <LinkDropdown links={links3(user)}></LinkDropdown>
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
        component={Link}
        to='/articles'
      >
        Articles
      </Button>
      {error && <Typography color='red'>{error}</Typography>}
      <Button
        size='small'
        variant='contained'
        sx={{
          color: 'white',
          marginLeft: '1rem',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        }}
        onClick={handleSubmit}
      >
        Logout
      </Button>
    </Box>
    <Box
      sx={{
        flexGrow: 1,
        display: { xs: 'flex', md: 'none' },
        justifyContent: 'flex-end',
      }}
    >
      <Dropdown links={links} />
    </Box>
  </>
)

const guestLinks = (
  <>
    <Box
      sx={{
        flexGrow: 1,
        display: { xs: 'none', md: 'flex' },
        justifyContent: 'flex-end',
      }}
    >
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
        component={Link}
        to='/articles'
      >
        Articles
      </Button>
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
        component={Link}
        to='/login'
      >
        Login
      </Button>
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
        component={Link}
        to='/register'
      >
        Register
      </Button>
    </Box>
    <Box
      sx={{
        flexGrow: 1,
        display: { xs: 'flex', md: 'none' },
        justifyContent: 'flex-end',
      }}
    >
      <Dropdown links={links2} />
    </Box>
  </>
)

const Header: React.FC<Props> = ({ isAuthenticated }) => {
  const { auth } = useContext(FirebaseContext)
  const { user } = useContext(UserContext)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const handleSumbit = (e: any) => {
    signOut(auth)
      .then((servResult: any) => {
        console.log(servResult)
        setError('')
        navigate('/')
      })
      .catch((e: any) => {
        setError(e.response.data.msg)
      })
  }

  return (
    <AppBar position='fixed' color='inherit'>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
          <Link to='/' style={{ height: '2.5rem', alignContent: 'center' }}>
            <img
              src={Logo}
              alt='Finberry Logo'
              style={{ flexGrow: 1, height: '100%' }}
            />
          </Link>
        </Box>
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <Link to='/' style={{ height: '2.5rem', alignContent: 'center' }}>
            <img
              src={BerryLogo}
              alt='Finberry Logo'
              style={{ flexGrow: 1, height: '100%' }}
            />
          </Link>
        </Box>
        {isAuthenticated ? authLinks(handleSumbit, error, user) : guestLinks}
      </Toolbar>
    </AppBar>
  )
}

export default Header;