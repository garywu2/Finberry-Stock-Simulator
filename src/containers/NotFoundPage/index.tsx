import { Box, Container, Grid, Typography } from "@mui/material";
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
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
          borderRadius: '0 0 3rem 3rem',
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
                variant='h1'
                align='center'
                fontWeight={400}
                padding={'2rem 0'}
              >
                404
              </Typography>
              <Typography
                variant='h2'
                align='center'
                fontWeight={400}
                padding={'2rem 0'}
              >
                Page not found
              </Typography>
              <Typography
                variant='h3'
                align='center'
                fontWeight={400}
                padding={'2rem 0'}
              >
                Sorry the page you are trying to access does not exist
              </Typography>
              <Link
                style={{
                  fontFamily: 'Fredoka',
                  margin: '10px',
                  fontSize: '20px',
                }}
                to='/'
              >
                {' '}
                Click here to return to home page{' '}
              </Link>
            </Grid>
            <Grid item xs={2}></Grid>
          </Grid>
        </Box>
      </Container>
    </div>
  )
};
export default NotFoundPage;