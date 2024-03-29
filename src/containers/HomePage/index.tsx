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

const route =
  process.env.REACT_APP_FINBERRY_DEVELOPMENT === 'true'
    ? 'http://localhost:5000/'
    : 'https://finberry-stock-simulator-server.vercel.app/'
interface StockData {
  symbol: string
  name: string
  exchange: string
  price: number
  change: number
}

const HomePage = () => {
  const { user } = useContext(UserContext)
  const navigate = useNavigate()
  const [stockData, setStockData] = useState<StockData[]>([])

  useEffect(() => {
    axios
      .get(
        route + 'game/marketmovers'
      )
      .then((res) => {
        setStockData(res.data)
      })
      .catch((error) => {
        console.log(error)
      })
  }, [])

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
                  item
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
                  item
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
                item
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
                item
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
                        <TableCell>Symbol</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Exchange</TableCell>
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
                          <TableCell>{stock?.name}</TableCell>
                          <TableCell>{stock?.exchange}</TableCell>
                          <TableCell align='right'>${stock?.high}</TableCell>
                          <TableCell align='right'>
                            %{stock?.percent_change}
                          </TableCell>
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
