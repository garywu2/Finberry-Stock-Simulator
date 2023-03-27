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
import { Link, useParams } from 'react-router-dom';

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

const CoachPortalPage = () => {
    const { user } = useContext(UserContext);
    const [userItem, setUserItem] = React.useState<any>([]);
    const [coachItem, setCoachItem] = React.useState<any>([]);
    const [open, setOpen] = React.useState(false);
    const [open2, setOpen2] = React.useState(false);
    const [bioText, setBioText] = useState("");
    const [isApprovedCoach, setIsApprovedCoach] = React.useState(false);
    const { email } = useParams();

    

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
          'account/user/email/' +
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
          'account/coaching/' +
          String(coachItem._id),
        headers: {},
        data: {
          description: bioText
        }
      }).then((result: any) => {
        axios.get(route + 'account/coaching', {
            params: {
              email: String(user.email),
              moreDetails: true,
            }
          }).then((response) => {
            setCoachItem(response.data[0]);
          })
      });

      setOpen2(false);
    };

    const handleBioTextChange = (event: any) => {
      setBioText(event.target.value)
    }

    React.useEffect(() => {
      axios.get(route + 'account/user', {
        params: {
          email: String(user.email)
        }
      }).then((response) => {
        setUserItem(response.data[0]);
        if(response.data[0]){
          setCurrImg(response.data[0].avatar);
        }
      })
    }, [email]);

    React.useEffect(() => {
        axios.get(route + 'account/coaching', {
          params: {
            email: String(user.email),
            moreDetails: true,
          }
        }).then((response) => {
          setCoachItem(response.data[0]);
          if(response.data[0].status == 1){
            setIsApprovedCoach(true);
          }
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
          { isApprovedCoach && coachItem && userItem ? (
            <Grid container spacing={3}>
            <Grid item xs={12} md={4} lg={3}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 260,
                }}
              > 

                           
                <Avatar
                    sx={{ bgcolor: deepOrange[500], width: 120, height: 120}}
                    alt={userItem.firstName}
                    src={currImg}
                  >
                </Avatar>

                <Typography variant='body1' align='center' fontWeight={'bold'} color='green'>
                  Approved Coach
                </Typography>

                <Typography variant='body1' align='center' fontWeight={400}>
                  {userItem.username}
                </Typography>

                <Typography variant='body1' align='center' fontWeight={400}>
                  {userItem.firstName} {userItem.lastName}
                </Typography>
                {user.email === email &&
                <Button variant="outlined" onClick={handleClickOpen}>
                  Change Avatar
                </Button>
               } 
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
                  height: 260,
                }}
              >
                <Typography variant='h4' align='left' fontWeight={400}>
                  Coaching Bio:
                </Typography>
                <Typography variant='body1' align='left' fontWeight={400}>
                  {coachItem.description}
                </Typography>
                {user.email === email &&
                <Button variant="outlined" onClick={handleClickOpen2}>
                  Edit Bio
                </Button>
                }
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
                  Service Fee: ${coachItem.price}/hour
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper
                sx={{ p: 2, display: 'flex', flexDirection: 'column' }}
              >
                {coachItem.reviews.length > 0 ? (
                    <Typography variant='h4' align='left' fontWeight={400}>
                        Reviews:
                    </Typography>
                    ):(
                    <Typography variant='h4' align='left' fontWeight={400}>
                        No reviews on Coach currently.
                    </Typography>
                    )}
              </Paper>
            </Grid>
            {user.email === email &&
                <Grid item xs={12}>
                <Paper
                    sx={{ p: 2, display: 'flex', flexDirection: 'column' }}
                >
                    {coachItem.coachingClients.length > 0 ? (
                    <Typography variant='h4' align='left' fontWeight={400}>
                        Clients currently being coached: 
                    </Typography>
                    ):(
                    <Typography variant='h4' align='left' fontWeight={400}>
                        You currently have no clients.
                    </Typography>
                    )}
                </Paper>
                </Grid>
            }  
          </Grid>
          ) : (
            <Typography variant='h4' align='left' fontWeight={400} color='white'>
                If you submitted a Coach Registration request, it has not been approved yet.
            </Typography>
          )}  
          
        </Container>
      </Container>
    )
}

export default CoachPortalPage; 