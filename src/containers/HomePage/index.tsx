import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useContext, useState, useEffect } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'

import Pricing from '../../components/Pricing'
import UserContext from '../../context/user'
import IPad from '../../images/photos/ipad-mini.png'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
}

const HomePage = () => {
  const { user } = useContext(UserContext)
  const navigate = useNavigate()
  // const [stockData, setStockData] = useState<StockData[]>([])

  const stockData = [
    {
      symbol: 'BSET',
      name: 'Bassett Furniture Industries Inc',
      exchange: 'NASDAQ',
      mic_code: 'XNAS',
      datetime: '2022-01-31 09:34:00',
      last: 17.25,
      high: 17.35,
      low: 15.90999,
      volume: 108297,
      change: 3.31,
      percent_change: 23.74462,
    },
    {
      symbol: 'TWKS',
      name: 'Thoughtworks Holding, Inc.',
      exchange: 'NASDAQ',
      mic_code: 'XNAS',
      datetime: '2022-01-31 09:34:40',
      last: 20.09,
      high: 19.62999,
      low: 18.29999,
      volume: 392376,
      change: 3.98,
      percent_change: 20.84861,
    },
    {
      symbol: 'RMED',
      name: 'RA Medical Systems Inc',
      exchange: 'NYSE',
      mic_code: 'XNAS',
      datetime: '2022-01-31 09:33:50',
      last: 0.984,
      high: 0.98519,
      low: 0.984,
      volume: 4480,
      change: 0.159,
      percent_change: 17.84511,
    },
  ]

  // useEffect(() => {
  //   axios
  //     .get(
  //       `https://api.twelvedata.com/market_movers/stocks?apikey=${process.env.REACT_APP_FINBERRY_TWELVEDATA_API_KEY}&outputsize=5`
  //     )
  //     .then((res) => {
  //       setStockData(res.data.values)
  //     })
  //     .catch((error) => {
  //       console.log(error)
  //     })
  // }, [])

  return (
    <div>
      {!user ? (
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
              padding: '2rem',
            }}
          >
            <Box
              display={'flex'}
              sx={{
                width: '100%',
                margin: { sm: '0rem', lg: '3rem' },
                paddingBottom: '3rem',
              }}
            >
              <Grid
                container
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Grid
                  xs={12}
                  lg={6}
                  sx={{
                    padding: {
                      lg: '2rem',
                      md: '5rem 10rem',
                      sm: '5rem 7rem',
                      xs: '0rem',
                    },
                  }}
                >
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
                      experience without risking your money. Sign up today to
                      start learning!
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
                <Grid
                  xs={12}
                  lg={6}
                  sx={{ paddingTop: { xs: '2rem', lg: '0rem' } }}
                >
                  <Card
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                      width: { xs: '100%', md: '70%', sm: '70%', lg: '80%' },
                      margin: 'auto',
                    }}
                  >
                    <CardContent>
                      <CardMedia
                        component='img'
                        image={IPad}
                        alt='iPad App Preview'
                      />
                    </CardContent>
                  </Card>
                </Grid>
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
              padding: '2rem',
            }}
          >
            <Grid
              container
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Grid
                xs={12}
                lg={6}
                sx={{
                  padding: {
                    lg: '2rem',
                    md: '5rem 10rem',
                    sm: '5rem 7rem',
                    xs: '0rem',
                  },
                }}
              >
                <Typography
                  component='div'
                  variant='h3'
                  align='left'
                  fontWeight={400}
                  sx={{ color: 'text.primary', marginBottom: '1rem' }}
                >
                  <Box fontWeight='fontWeightBold' display='inline'>
                    You could explore the world of investing with Finberry.
                  </Box>
                </Typography>
                <Typography
                  variant='h6'
                  align='left'
                  fontWeight={400}
                  sx={{ color: 'text.primary', marginBottom: '1rem' }}
                >
                  <Box fontWeight='500' display='inline'>
                    With important features like real-time stock data, trend
                    analysis, and a simulated portfolio, Finberry is the perfect
                    tool for beginners to learn about investing.
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
                  <b>Explore Now</b>
                </Button>
              </Grid>
              <Grid
                xs={12}
                lg={6}
                sx={{ paddingTop: { xs: '2rem', lg: '0rem' } }}
              >
                <TableContainer
                  component={Paper}
                  sx={{
                    width: { xs: '100%', md: '70%', sm: '70%', lg: '80%' },
                    margin: 'auto',
                  }}
                >
                  <Table
                    sx={{ minWidth: 650 }}
                    aria-label='market movers table'
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell colSpan={5}>
                          <Typography
                            sx={{ color: 'primary.main' }}
                            variant='h6'
                            id='tableTitle'
                          >
                            Market Movers
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Symbol</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell align='right'>Price</TableCell>
                        <TableCell align='right'>Change</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stockData.map((stock: any) => (
                        <TableRow
                          key={stock?.name}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                          }}
                        >
                          <TableCell component='th' scope='row'>
                            {stock?.symbol}
                          </TableCell>
                          <TableCell>{stock?.symbol}</TableCell>
                          <TableCell>{stock?.name}</TableCell>
                          <TableCell align='right'>${stock?.last}</TableCell>
                          <TableCell align='right'>%{stock?.change}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
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
              padding: '2rem',
            }}
          >
            <Pricing />
          </Container>
        </div>
      ) : (
        <Navigate to={'/profile/' + user.email}></Navigate>
      )}
    </div>
  )
}

export default HomePage
