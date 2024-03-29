import { Box, Button, Container, Grid, TextField, Typography } from "@mui/material";
import { Link } from 'react-router-dom';
import axios from "axios";
import { useContext, useState } from "react";

const ContactPage = () => {

    return (
      <div>
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
          }}
        >
          <Box
            component='form'
            display={'flex'}
            sx={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              width: { xs: '100%', sm: '100%', md: '75%', lg: '50%' },
              paddingBottom: '3rem',
              textAlign: 'center',
              margin: { sm: '0rem', lg: '3rem' },
            }}
            noValidate
            autoComplete='off'
          >
            <Grid container>
              <Grid item xs={2}></Grid>
              <Grid
                item
                xs={8}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant='h3'
                  align='center'
                  fontWeight={400}
                  padding={'2rem 0'}
                >
                  Contact Us
                </Typography>
                <TextField
                  required
                  id='contact-name'
                  label='Full Name'
                  name='name'
                  margin='normal'
                  sx={{
                    width: '100%',
                  }}
                  color='primary'
                />
                <TextField
                  required
                  id='contact-email'
                  label='Email'
                  name='email'
                  margin='normal'
                  sx={{
                    width: '100%',
                  }}
                  color='primary'
                />
                <TextField
                  required
                  id='contact-message'
                  label='Enter your message here'
                  name='email'
                  margin='normal'
                  sx={{
                    width: '100%',
                  }}
                  color='primary'
                  multiline
                  rows={4}
                />
                <Button
                  size='medium'
                  fullWidth
                  sx={{
                    backgroundColor: 'secondary.main',
                    color: 'white',
                    marginY: '1rem',
                    '&:hover': {
                      backgroundColor: 'secondary.dark',
                    },
                  }}
                  // onClick={handleSumbit}
                >
                  Submit
                </Button>
              </Grid>
              <Grid item xs={2}></Grid>
            </Grid>
          </Box>
        </Container>
      </div>
    )
};
export default ContactPage;