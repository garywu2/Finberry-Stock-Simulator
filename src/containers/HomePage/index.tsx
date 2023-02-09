import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import { Link } from 'react-router-dom'
import { styled } from '@mui/material/styles'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}))

const HomePage = () => {
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
        }}
      >
        <Grid container>
          <Grid xs={2}></Grid>
          <Grid xs={4}>
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
          <Grid xs={4}>
            <Item>
              We eventually want to have a preview of our apps (web and mobile
              view)
            </Item>
          </Grid>
          <Grid xs={2}></Grid>
        </Grid>
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
        }}
      >
        <Typography variant='h3' align='center' fontWeight={400}>
          Some content about the top 5 stocks today (name, price, change, chart)
        </Typography>
      </Container>
      <Container
        sx={{
          borderRadius: '3rem 3rem 0 0',
          boxShadow: '0 4px 15px -1px black',
          backgroundColor: 'secondary.main',
          minHeight: '100vh',
          minWidth: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '1rem',
        }}
      >
        <Typography variant='h3' align='center' fontWeight={400}>
          Some content about creating your simulated trading portfolio, ongoign
          competitions, all time high scores, testimonials, highlight some high
          ranked coaches
        </Typography>
      </Container>
    </div>
  )
}

export default HomePage
