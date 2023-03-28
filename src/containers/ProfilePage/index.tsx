import UserContext from "../../context/user";
import { useContext, useState } from "react";
import React from 'react'
import axios from 'axios'
import { Box, Button, Container, Grid, TextField, Typography, Paper, Avatar } from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Link, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles'

const Av1 = require('../../images/avatars/a1.png')
const Av2 = require('../../images/avatars/a2.png')
const Av3 = require('../../images/avatars/a3.png')
const Av4 = require('../../images/avatars/a4.png')
const Av5 = require('../../images/avatars/a5.png')
const Av6 = require('../../images/avatars/a6.png')
const Av7 = require('../../images/avatars/a7.png')
const Av8 = require('../../images/avatars/a8.png')
const Av9 = require('../../images/avatars/a9.png')
const Av10 = require('../../images/avatars/a10.png')
const Av11 = require('../../images/avatars/a11.png')
const Av12 = require('../../images/avatars/a12.png')
const Av13 = require('../../images/avatars/a13.png')
const Av14 = require('../../images/avatars/a14.png')
const Av15 = require('../../images/avatars/a15.png')
const Av16 = require('../../images/avatars/a16.png')
const Av17 = require('../../images/avatars/a17.png')
const Av18 = require('../../images/avatars/a18.png')
const Av19 = require('../../images/avatars/a19.png')
const Av20 = require('../../images/avatars/a20.png')
const Av21 = require('../../images/avatars/a21.png')
const Av22 = require('../../images/avatars/a22.png')
const Av23 = require('../../images/avatars/a23.png')
const Av24 = require('../../images/avatars/a24.png')
const Av25 = require('../../images/avatars/a25.png')
const Av26 = require('../../images/avatars/a26.png')
const Av27 = require('../../images/avatars/a27.png')
const Av28 = require('../../images/avatars/a28.png')
const Av29 = require('../../images/avatars/a29.png')
const Av30 = require('../../images/avatars/a30.png')

const route =
  process.env.REACT_APP_FINBERRY_DEVELOPMENT === 'true'
    ? 'http://localhost:5000/'
    : 'https://finberry-stock-simulator-server.vercel.app/'
var currImg: any

const ProfilePage = () => {
  const { user } = useContext(UserContext)
  const [userItem, setUserItem] = React.useState<any>([])
  const [open, setOpen] = React.useState(false)
  const [open2, setOpen2] = React.useState(false)
  const [bioText, setBioText] = useState('')
  const { email } = useParams()
  const theme = useTheme()

  const avatars = [
    { img: Av1, string: '../../images/avatars/a1.png' },
    { img: Av2, string: '../../images/avatars/a2.png' },
    { img: Av3, string: '../../images/avatars/a3.png' },
    { img: Av4, string: '../../images/avatars/a4.png' },
    { img: Av5, string: '../../images/avatars/a5.png' },
    { img: Av6, string: '../../images/avatars/a6.png' },
    { img: Av7, string: '../../images/avatars/a7.png' },
    { img: Av8, string: '../../images/avatars/a8.png' },
    { img: Av9, string: '../../images/avatars/a9.png' },
    { img: Av10, string: '../../images/avatars/a10.png' },
    { img: Av11, string: '../../images/avatars/a11.png' },
    { img: Av12, string: '../../images/avatars/a12.png' },
    { img: Av13, string: '../../images/avatars/a13.png' },
    { img: Av14, string: '../../images/avatars/a14.png' },
    { img: Av15, string: '../../images/avatars/a15.png' },
    { img: Av16, string: '../../images/avatars/a16.png' },
    { img: Av17, string: '../../images/avatars/a17.png' },
    { img: Av18, string: '../../images/avatars/a18.png' },
    { img: Av19, string: '../../images/avatars/a19.png' },
    { img: Av20, string: '../../images/avatars/a20.png' },
    { img: Av21, string: '../../images/avatars/a21.png' },
    { img: Av22, string: '../../images/avatars/a22.png' },
    { img: Av23, string: '../../images/avatars/a23.png' },
    { img: Av24, string: '../../images/avatars/a24.png' },
    { img: Av25, string: '../../images/avatars/a25.png' },
    { img: Av26, string: '../../images/avatars/a26.png' },
    { img: Av27, string: '../../images/avatars/a27.png' },
    { img: Av28, string: '../../images/avatars/a28.png' },
    { img: Av29, string: '../../images/avatars/a29.png' },
    { img: Av30, string: '../../images/avatars/a30.png' },
  ]

  const setCurrImg = (imgStr: any) => {
    for (var i = 0; i < avatars.length; i++) {
      if (avatars[i].string == imgStr) {
        currImg = avatars[i].img
      }
    }
  }

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClickOpen2 = () => {
    setOpen2(true)
  }

  const handleClose = (event: any) => {
    setOpen(false)
    setCurrImg(String(event.currentTarget.value))

    axios({
      method: 'put',
      url: route + 'account/user/email/' + String(user.email),
      headers: {},
      data: {
        avatar: String(event.currentTarget.value),
      },
    })
  }

  const handleClose2 = (event: any) => {
    setOpen2(false)
  }

  const handleBioSubmit = (event: any) => {
    axios({
      method: 'put',
      url: route + 'account/user/email/' + String(user.email),
      headers: {},
      data: {
        bio: bioText,
      },
    }).then((result: any) => {
      axios
        .get(route + 'account/user', {
          params: {
            email: String(user.email),
          },
        })
        .then((response) => {
          setUserItem(response.data[0])
        })
    })

    setOpen2(false)
  }

  const handleBioTextChange = (event: any) => {
    setBioText(event.target.value)
  }

  React.useEffect(() => {
    axios
      .get(route + 'account/user', {
        params: {
          email: String(email),
        },
      })
      .then((response) => {
        if (response?.data[0]) {
          setUserItem(response.data[0])
          setCurrImg(response.data[0].avatar)
        }
      })
  }, [email])

  return (
    <Container
      sx={{
        backgroundColor: 'primary.main',
        minHeight: '100vh',
        minWidth: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '3rem',
        boxShadow: '0 4px 15px -6px black',
        marginBottom: '1rem',
        paddingTop: '5rem',
        paddingBottom: '2rem',
        overflow: 'auto',
      }}
    >
      <Container maxWidth='xl' sx={{ mt: 4, mb: 4 }}>
        {userItem ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} lg={3}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 240,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    width: 120,
                    height: 120,
                  }}
                  alt={userItem.firstName}
                  src={currImg}
                ></Avatar>

                <Typography variant='body1' align='center' fontWeight={400}>
                  {userItem.username}
                </Typography>

                <Typography variant='body1' align='center' fontWeight={400}>
                  {userItem.firstName} {userItem.lastName}
                </Typography>
                {user.email === email && (
                  <Button variant='outlined' onClick={handleClickOpen}>
                    Change Avatar
                  </Button>
                )}
                <Dialog open={open} onClose={handleClose}>
                  <DialogTitle>Pick an Avatar</DialogTitle>
                  <DialogContent>
                    {avatars && (
                      <DialogContentText>
                        {avatars.map((avatar) => (
                          <Button
                            variant='outlined'
                            value={avatar.string}
                            startIcon={
                              <Avatar
                                sx={{
                                  bgcolor: theme.palette.secondary.main,
                                  width: 120,
                                  height: 120,
                                }}
                                alt={userItem.firstName}
                                src={avatar.img}
                              ></Avatar>
                            }
                            onClick={handleClose}
                          ></Button>
                        ))}
                      </DialogContentText>
                    )}
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                  </DialogActions>
                </Dialog>
              </Paper>
            </Grid>
            <Grid item xs={12} md={8} lg={9}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 240,
                }}
              >
                <Typography variant='h4' align='left' fontWeight={400}>
                  About Yourself:
                </Typography>
                <Typography variant='body1' align='left' fontWeight={400}>
                  {userItem.bio}
                </Typography>
                {user.email === email && (
                  <Button variant='outlined' onClick={handleClickOpen2}>
                    Edit Bio
                  </Button>
                )}
                <Dialog open={open2} onClose={handleClose2}>
                  <DialogTitle>Enter your new bio</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      <TextField
                        id='outlined-multiline-static'
                        label=''
                        multiline
                        rows={4}
                        defaultValue='I love DogeCoin'
                        value={bioText}
                        onChange={handleBioTextChange}
                      />
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleBioSubmit}>Confirm Edit</Button>
                    <Button onClick={handleClose2}>Cancel</Button>
                  </DialogActions>
                </Dialog>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant='h4' align='left' fontWeight={400}>
                  Badges:
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant='h4' align='left' fontWeight={400}>
                  Coaching Sessions:
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <></>
        )}
      </Container>
    </Container>
  )
}

export default ProfilePage;