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
import React from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}))



const HomePage = () => {
  const [items, setItems] = React.useState<any>();

  React.useEffect(() => {
    axios.get('https://api.twelvedata.com/time_series?&start_date=2005-02-01&symbol=aapl&interval=1month&apikey=bda95123e0344a5ba4e148064a3eabea').then((response) => {
      setItems(response.data)
      console.log(items)
    });
  }, []);

  var data = []

  if(items) {
    for (var i = items.values.length - 1; i >= 0; i--) {
      var temp = {date: String(items.values[i].datetime), price: Number(items.values[i].close)};
      data.push(temp)
    }
  }

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
      
      {items ? (
      <Container
        sx={{
          backgroundColor: 'white',
          minHeight: '100vh',
          minWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '1rem',
          marginBottom: '1rem',
        }}
      >
        <Typography variant='h3' align='center' fontWeight={400}>
          The price of ${items.meta.symbol} since {data[0].date}
        </Typography>
        <LineChart
          width={1200}
          height={800}
          data={data}
          margin={{ top: 5, right: 30, left: 30, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" label={{ value: "Date", position: "bottom", offset: 0 }} />
          <YAxis label={{ value: "Price", angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#8884d8" />
        </LineChart>

        <Typography variant='h3' fontWeight={400}>
          If you bought $1000 of ${items.meta.symbol} on {data[100].date}, it would be worth ${((1000/data[100].price * data[items.values.length - 1].price).toFixed(2)).toLocaleString()} on {data[items.values.length - 1].date}
        </Typography>

      </Container>
      ) : (
        <h1>error</h1>
      )}
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
