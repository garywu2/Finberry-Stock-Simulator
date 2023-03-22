import UserContext from "../../context/user";
import { useContext, useState } from "react";
import React from 'react'
import axios from 'axios'
import { Box, Button, Container, Grid, TextField, Typography, Paper } from "@mui/material";



const ProfilePage = () => {
    const { user } = useContext(UserContext)
    // Commenting out since its not being used, will be used later
    // React.useEffect(() => {

    //     axios.get('http://localhost:5000/account/user/' + String(user.email)).then((response) => {
    //         setItems(response.data);
    //         console.log(items)
    //     });
    // }, []);

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
            <Grid item xs={12} md={8} lg={9}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 240,
                }}
              ></Paper>
            </Grid>
            <Grid item xs={12} md={4} lg={3}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 240,
                }}
              ></Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper
                sx={{ p: 2, display: 'flex', flexDirection: 'column' }}
              ></Paper>
            </Grid>
          </Grid>
        </Container>
      </Container>
    )
}

export default ProfilePage;