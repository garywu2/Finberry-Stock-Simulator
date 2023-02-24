import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Pricing from '../../components/Pricing'
import UserContext from "../../context/user";


const HomePage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  return (<div>
    {!user ?
      (
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
              padding: '2rem'
            }}
          >
            <Box
              display={"flex"}
              sx={{
                width: "100%",
                margin: { sm: "0rem", lg: "3rem" },
                paddingBottom: "3rem"
              }}
            >
              <Grid container>
                <Grid xs={1} lg={1}></Grid>
                <Grid xs={10} lg={4}>
                  <Typography
                    component='div'
                    variant='h3'
                    align='left'
                    fontWeight={400}
                    sx={{ color: 'white', marginBottom: '1rem' }}
                  >
                    <Box fontWeight='fontWeightBold' display='inline'>
                      Make investing sweet and simple.
                    </Box>
                  </Typography>
                  <Typography
                    variant='h6'
                    align='left'
                    fontWeight={400}
                    sx={{ color: 'white', marginBottom: '1rem' }}
                  >
                    <Box fontWeight='500' display='inline'>
                      Finberry empowers you with hands-on, simulated investing
                      experience without risking your money. Sign up today to start
                      learning!
                    </Box>
                  </Typography>
                  <Button
                    size='large'
                    sx={{
                      backgroundColor: 'secondary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'secondary.dark',
                      },
                    }}
                    component={Link}
                    to='/register'
                  >
                    <b>Get Started</b>
                  </Button>
                </Grid>
                <Grid xs={1} lg={0}></Grid>
                <Grid xs={1} lg={0}></Grid>
                <Grid xs={10} lg={4} sx={{ paddingTop: { xs: "2rem", lg: "0rem" } }}>
                  <Typography
                    component='div'
                    variant='h3'
                    align='left'
                    fontWeight={400}
                    sx={{ color: 'white', marginBottom: '1rem' }}
                  >
                    <Box fontWeight='fontWeightBold' display='inline'>
                      We'll eventually show app previews here.
                    </Box>
                  </Typography>
                </Grid>
                <Grid xs={1} lg={1}></Grid>
              </Grid>
            </Box>
          </Container>
          <Container
            sx={{
              backgroundColor: 'white',
              minHeight: '100vh',
              minWidth: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '1rem',
              marginBottom: '1rem',
              padding: '2rem'
            }}
          >
            <Typography variant='h3' align='center' fontWeight={400}>
              Some content about the top 5 stocks today (name, price, change, chart)
            </Typography>
          </Container>
          <Container
            sx={{
              borderRadius: '3rem',
              boxShadow: '0 4px 15px -1px black',
              backgroundColor: 'secondary.main',
              minHeight: '100vh',
              minWidth: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '1rem',
              marginBottom: '1rem',
              padding: '2rem'
            }}
          >
            <Pricing />
          </Container>
        </div>
      ) : (
        <Navigate to='/profile'></Navigate>
      )}
  </div>
  )
}

export default HomePage
