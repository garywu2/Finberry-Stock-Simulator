import UserContext from '../../context/user'
import { useContext, useState } from 'react'
import React from 'react'
import axios from 'axios'
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  List,
  ListItem,
  Divider,
  ListItemAvatar,
  ListItemText
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Link, useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { width } from "@mui/system";
import FirebaseContext from "../../context/firebase";

import { trackPromise } from 'react-promise-tracker'
import Spinner from '../../components/Spinner'
import { areas } from '../../constants/areas'

const Av0 = require('../../images/avatars/a0.png')
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

const Ba1 = require('../../images/badges/welcome.png')

const route =
  process.env.REACT_APP_FINBERRY_DEVELOPMENT === 'true'
    ? 'http://localhost:5000/'
    : 'https://finberry-stock-simulator-server.vercel.app/'
var currImg: any

const ProfilePage = () => {
  const { user } = useContext(UserContext);
  const [userItem, setUserItem] = React.useState<any>([]);
  const [chatItems, setChatItems] = React.useState<any>([]);
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const [open3, setOpen3] = React.useState(false);
  const [coachingSessionsReq, setCoachingSessionsReq] = React.useState<any>([]);
  const [coachingSessionsAct, setCoachingSessionsAct] = React.useState<any>([]);
  const [bioText, setBioText] = useState("");
  const [chatMsgText, setChatMsgText] = useState("");
  const { email } = useParams();
  const theme = useTheme();
  const { auth } = useContext(FirebaseContext);

  const avatars = [
    { img: Av0, string: '../../images/avatars/a0.png' },
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

  const badges = [
    { img: Ba1, name: 'welcome', string: '../../images/badges/Ba1.png' },
  ]

  const setCurrImg = (imgStr: any) => {
    for (var i = 0; i < avatars.length; i++) {
      if (avatars[i].string == imgStr) {
        currImg = avatars[i].img
      }
    }
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const handleCancel2 = () => {
    setOpen2(false)
  }

  const handleCancel3 = () => {
    setOpen3(false);
  }

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClickOpen2 = () => {
    setOpen2(true)
  }

  const handleClickOpen3 = (e: any) => {
    setOpen3(true);

    axios({
      method: "get",
      url: route + 'account/chatmessage',
      params: {
        coachingSession: e.target.value
      }
    }).then((response) => {
      setChatItems(response?.data?.reverse())
    });
  };

  const handleClose = (event: any) => {
    setOpen(false)
    setCurrImg(String(event.currentTarget.value))

    axios({
      method: 'put',
      url: route + 'account/user/email/' + String(user?.email),
      headers: {},
      data: {
        avatar: String(event.currentTarget.value),
      },
    })
  }

  const handleClose2 = (event: any) => {
    setOpen2(false)
  }

  const handleClose3 = (event: any) => {
    setOpen3(false);
  };

  const handleChatMsgSubmit = (event: any) => {
    axios({
      method: 'post',
      url: route + 'account/chatmessage' ,
      data: {
        coachingSession: event.target.value,
        email: user.email,
        message: chatMsgText
      }
    }).then((response) => {
      axios({
        method: "get",
        url: route + 'account/chatmessage',
        params: {
          coachingSession: event.target.value
        }
      }).then((response) => {
        setChatItems(response?.data?.reverse())
      });
    });
  }

  const handleBioSubmit = (event: any) => {
    axios({
      method: 'put',
      url: route + 'account/user/email/' + String(user?.email),
      headers: {},
      data: {
        bio: bioText,
      },
    }).then((result: any) => {
      trackPromise(
        axios
          .get(route + 'account/user', {
            params: {
              email: String(user?.email),
            },
          })
          .then((response) => {
            setUserItem(response.data[0])
          }),
        areas.profileUserBioSubmit
      )
    })
    setOpen2(false)
  }

  const handleBioTextChange = (event: any) => {
    setBioText(event.target.value)
  }

  const handleChatMsgTextChange = (event: any) => {
    setChatMsgText(event.target.value);
  };

  React.useEffect(() => {
    trackPromise(
      axios
        .get(route + 'account/user', {
          params: {
            email: String(email),
          },
        })
        .then((response) => {
          if (response?.data[0]) {
            setUserItem(response.data[0])
            setBioText(response.data[0].bio)
            setCurrImg(response.data[0].avatar)
          }
          trackPromise(axios
          .get(route + "account/coachingsession", {
            params: {
              client: response?.data[0]._id,
              status: 0,
              minorPopulateCoachAndUser: true
            },
          }),  areas.profileCoachInfo)
          .then((res) => {
            setCoachingSessionsReq(res?.data);
          });
        trackPromise(
          axios.get(route + 'account/coachingsession', {
            params: {
              client: response?.data[0]._id,
              status: 1,
              minorPopulateCoachAndUser: true,
            },
          }),
          areas.profileCoachInfo
        ).then((res) => {
          setCoachingSessionsAct(res?.data)
        })
        }),
      areas.profileUserInfo
    )
  }, [email, auth, user])

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
                  alignItems: 'center',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  height: 240,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    width: 120,
                    height: 120,
                    align: 'center',
                    justifyContent: 'center',
                  }}
                  alt={userItem.firstName}
                  src={currImg}
                ></Avatar>

                <Typography variant='body1' align='center' fontWeight={400}>
                  <Spinner area={areas.profileUserInfo} />
                  {userItem.username}
                </Typography>

                <Typography variant='body1' align='center' fontWeight={400}>
                  {userItem.firstName} {userItem.lastName}
                </Typography>
                {user?.email === email && (
                  <Button variant='outlined' onClick={handleClickOpen}>
                    Change Avatar
                  </Button>
                )}
                <Dialog
                  open={open}
                  onClose={handleClose}
                  fullWidth={true}
                  maxWidth='lg'
                >
                  <DialogTitle>Choose your avatar</DialogTitle>
                  <DialogContent>
                    {avatars && (
                      <DialogContentText>
                        {avatars.map((avatar) => (
                          <Button
                            variant='outlined'
                            value={avatar.string}
                            key={avatar.string}
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
                    <Button onClick={handleCancel}>Cancel</Button>
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
                  About:
                </Typography>
                <Typography
                  variant='body1'
                  align='left'
                  fontWeight={400}
                  sx={{ overflow: 'auto' }}
                  height='100%'
                  marginBottom={2}
                >
                  <Spinner area={areas.profileUserInfo} />
                  <Spinner area={areas.profileUserBioSubmit} />
                  {userItem.bio}
                </Typography>
                {user?.email === email && (
                  <Button variant='outlined' onClick={handleClickOpen2}>
                    Edit Bio
                  </Button>
                )}
                <Dialog
                  open={open2}
                  onClose={handleClose2}
                  fullWidth={true}
                  maxWidth='lg'
                >
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
                        fullWidth={true}
                      />
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleBioSubmit}>Confirm Edit</Button>
                    <Button onClick={handleCancel2}>Cancel</Button>
                  </DialogActions>
                </Dialog>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Typography variant='h4' align='left' fontWeight={400}>
                  Badges:
                </Typography>
                <Tooltip arrow title='Welcome Badge' placement='right'>
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.secondary.main,
                      width: 120,
                      height: 120,
                    }}
                    alt={'Welcome Badge'}
                    src={Ba1}
                  ></Avatar>
                </Tooltip>
              </Paper>
            </Grid>
            {user?.email === email && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant='h4' align='left' fontWeight={400}>
                    Coaching:
                    <Spinner area={areas.profileCoachInfo} />
                  </Typography>
                  {coachingSessionsReq.length > 0 ? (
                    <Typography variant='h6' align='left' fontWeight={400}>
                      Pending requests:
                      <Spinner area={areas.profileCoachInfo} />
                    </Typography>
                  ) : (
                    <Typography variant='body1' align='left' fontWeight={400}>
                      You have no pending requests.
                      <Spinner area={areas.profileCoachInfo} />
                    </Typography>
                  )}

                  {coachingSessionsReq.length > 0 && coachingSessionsReq && (
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Coach</TableCell>
                          <TableCell>Rate</TableCell>
                          <TableCell align='left'>Request Message</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {coachingSessionsReq.map((session: any) => (
                          <TableRow key={session._id}>
                            <TableCell>
                              <Link
                                style={{
                                  fontFamily: 'Fredoka',
                                  margin: '10px',
                                }}
                                to={"/CoachPortal/" + session.coach?.email}
                              >
                                {session.coach.username}
                              </Link>
                            </TableCell>
                            <TableCell>${session.agreedPayment}/hr</TableCell>
                            <TableCell align='left'>
                              {session.clientRequestNote}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {coachingSessionsAct.length > 0 ? (
                    <Typography variant='h6' align='left' fontWeight={400}>
                      Active Sessions:
                      <Spinner area={areas.profileCoachInfo} />
                    </Typography>
                  ) : (
                    <Typography variant='body1' align='left' fontWeight={400}>
                      You have no active coaching sessions.
                      <Spinner area={areas.profileCoachInfo} />
                    </Typography>
                  )}

                  {coachingSessionsAct.length > 0 && coachingSessionsAct && (
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Coach</TableCell>
                          <TableCell>Rate</TableCell>
                          <TableCell align="left">Session</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {coachingSessionsAct.map((session: any) => (
                          <TableRow key={session._id}>
                            <TableCell>
                              <Link
                                style={{
                                  fontFamily: 'Fredoka',
                                  margin: '10px',
                                }}
                                to={"/CoachPortal/" + session.coach?.email}
                              >
                                {session.coach?.username}
                              </Link>
                            </TableCell>
                            <TableCell>${session.agreedPayment}/hr</TableCell>
                            <TableCell align="left">
                              <Button
                                variant='outlined'
                                value={session._id}
                                onClick={handleClickOpen3}
                              >
                                Open Chat
                              </Button>
                              <Dialog
                                open={open3}
                                onClose={handleClose3}
                                fullWidth={true}
                                maxWidth="lg"
                              >
                                <DialogTitle>Chat</DialogTitle>
                                <DialogContent>
                                  <DialogContentText>
                                    {chatItems && (
                                      <Grid item xs={12}>
                                        <List>
                                            {chatItems.map((chatMsg: any) => (
                                            <ListItem>
                                                {chatMsg.user == session.client._id ? (
                                                  <Grid container>
                                                    <Grid item xs={12}>
                                                        <ListItemText sx={{display:'flex', justifyContent:'flex-end'}} primary={chatMsg.message}></ListItemText>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <ListItemText sx={{display:'flex', justifyContent:'flex-end'}} secondary={chatMsg.timeSend.slice(0,10) + ' at ' + chatMsg.timeSend.slice(11,16)}></ListItemText>
                                                    </Grid>
                                                  </Grid>
                                                ):(
                                                  <Grid container>
                                                    <Grid item xs={12}>
                                                        <ListItemText sx={{display:'flex', justifyContent:'flex-start'}} primary={chatMsg.message}></ListItemText>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <ListItemText sx={{display:'flex', justifyContent:'flex-start'}} secondary={chatMsg.timeSend.slice(0,10) + ' at ' + chatMsg.timeSend.slice(11,16)}></ListItemText>
                                                    </Grid>
                                                  </Grid>
                                                )}
                                                
                                            </ListItem>
                                            ))}
                                        </List>
                                        <Divider />
                                        <Grid container style={{padding: '20px'}}>
                                        <Grid item xs={11}>
                                            <TextField id="outlined-basic-email" label="Type Something" fullWidth value={chatMsgText} onChange={handleChatMsgTextChange}/>
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                    )}
                                  </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                  <Button value={session._id} onClick={handleChatMsgSubmit}>Send Chat Message</Button>
                                  <Button onClick={handleCancel3}>Cancel</Button>
                                </DialogActions>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
        ) : (
          <></>
        )}
      </Container>
    </Container>
  )
}

export default ProfilePage
