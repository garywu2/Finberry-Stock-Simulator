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
import { deepOrange } from '@mui/material/colors';

const Av1 = require("../../images/avatars/icons8-badger-100.png");
const Av2 = require("../../images/avatars/icons8-bear-100.png");
const Av3 = require("../../images/avatars/icons8-leopard-100.png");
const Av4 = require("../../images/avatars/icons8-lion-100.png");
const Av5 = require("../../images/avatars/icons8-monkey-face-100.png");
const Av6 = require("../../images/avatars/icons8-panda-100.png");
const Av7 = require("../../images/avatars/icons8-tiger-face-100.png");
const Av8 = require("../../images/avatars/icons8-wolf-100.png");

const route =
  process.env.REACT_APP_FINBERRY_DEVELOPMENT === 'true'
    ? 'http://localhost:5000/'
    : 'https://finberry-stock-simulator-server.vercel.app/'
var currImg: any;

const ProfilePage = () => {
    const { user } = useContext(UserContext);
    const [userItem, setUserItem] = React.useState<any>([]);
    const [open, setOpen] = React.useState(false);
    const [open2, setOpen2] = React.useState(false);
    const [bioText, setBioText] = useState("");

    const avatars = [
      { img: Av1, string :"../../images/avatars/icons8-badger-100.png"},
      { img: Av2, string :"../../images/avatars/icons8-bear-100.png"},
      { img: Av3, string :"../../images/avatars/icons8-leopard-100.png"},
      { img: Av4, string :"../../images/avatars/icons8-lion-100.png"},
      { img: Av5, string :"../../images/avatars/icons8-monkey-face-100.png"},
      { img: Av6, string :"../../images/avatars/icons8-panda-100.png"},
      { img: Av7, string :"../../images/avatars/icons8-tiger-face-100.png"},
      { img: Av8, string :"../../images/avatars/icons8-wolf-100.png"}
    ];

    const setCurrImg = (imgStr: any) => {
      for(var i = 0; i < avatars.length; i++) {
        if(avatars[i].string == imgStr) {
          currImg = avatars[i].img;
        }
      }
    };

    const handleClickOpen = () => {
      setOpen(true);
    };

    const handleClickOpen2 = () => {
      setOpen2(true);
    };

    const handleClose = (event: any) => {
      setOpen(false);
      setCurrImg(String(event.currentTarget.value));
      
      axios({
        method: 'put',
        url:
          route +
          'account/user/' +
          String(user.email),
        headers: {},
        data: {
          avatar: String(event.currentTarget.value)
        }
      });
    };

    const handleClose2 = (event: any) => {
      setOpen2(false);
    };

    const handleBioSubmit = (event: any) => {
      axios({
        method: 'put',
        url:
          route +
          'account/user/' +
          String(user.email),
        headers: {},
        data: {
          bio: bioText
        }
      }).then((result: any) => {
        axios.get(route + 'account/user/' + String(user.email)).then((response) => {
          setUserItem(response.data);
        })
      });

      setOpen2(false);
    };

    const handleBioTextChange = (event: any) => {
      setBioText(event.target.value)
    }

    React.useEffect(() => {
      axios.get(route + 'account/user/' + String(user.email)).then((response) => {
        setUserItem(response.data);
        setCurrImg(response.data.avatar);
      })
    }, []);

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
        <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
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
                    sx={{ bgcolor: deepOrange[500], width: 120, height: 120}}
                    alt={userItem.firstName}
                    src={currImg}
                  >
                </Avatar>

                <Typography variant='body1' align='center' fontWeight={400}>
                  {userItem.username}
                </Typography>

                <Typography variant='body1' align='center' fontWeight={400}>
                  {userItem.firstName} {userItem.lastName}
                </Typography>

                <Button variant="outlined" onClick={handleClickOpen}>
                  Change Avatar
                </Button>
                <Dialog open={open} onClose={handleClose}>
                  <DialogTitle>Pick an Avatar</DialogTitle>
                  <DialogContent>
                      {avatars && (
                        <DialogContentText>
                        {avatars.map((avatar) => (
                                <Button variant="outlined" value={avatar.string} startIcon={<Avatar
                                                                    sx={{ bgcolor: deepOrange[500], width: 120, height: 120}}
                                                                    alt={userItem.firstName}
                                                                    src={avatar.img}
                                                                  >
                                                                </Avatar>}
                                                          
                                                                onClick={handleClose}
                                >
                                </Button>
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
                
                <Button variant="outlined" onClick={handleClickOpen2}>
                  Edit Bio
                </Button>
                <Dialog open={open2} onClose={handleClose2}>
                  <DialogTitle>Enter your new bio</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      <TextField
                        id="outlined-multiline-static"
                        label=""
                        multiline
                        rows={4}
                        defaultValue="I love DogeCoin"
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
              <Paper
                sx={{ p: 2, display: 'flex', flexDirection: 'column' }}
              >
                <Typography variant='h4' align='left' fontWeight={400}>
                  Badges: 
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper
                sx={{ p: 2, display: 'flex', flexDirection: 'column' }}
              >
                <Typography variant='h4' align='left' fontWeight={400}>
                  Coaching Sessions: 
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Container>
    )
}

export default ProfilePage;