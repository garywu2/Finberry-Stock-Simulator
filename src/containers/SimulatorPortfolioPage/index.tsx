import {
  Autocomplete,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Tab,
  TextField,
  Typography,
} from '@mui/material'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Link } from 'react-router-dom'
import React, { useContext, useState } from 'react'
import axios from 'axios'

import Title from '../../components/Title'
import Chart from '../../components/Chart'
import Balance from '../../components/Balance'
import Holdings from '../../components/Holdings'
import Orders from '../../components/Orders'
import UserContext from '../../context/user'

const route =
  process.env.REACT_APP_FINBERRY_DEVELOPMENT === 'true'
    ? 'http://localhost:5000/'
    : 'https://finberry-stock-simulator-server.vercel.app/'

var simulatorExists = false
var simIndex = 0
var rows: any[] = []
var chartData: any[] = []
var holdingsRows: any[] = []

const SimulatorPortfolioPage = () => {
  const { user } = useContext(UserContext)

  const [userItem, setUserItem] = React.useState<any>([])
  const [chartItems, setChartItems] = React.useState<any>()
  const [realTimePrice, setRealTimePrice] = React.useState<any>()
  const [tradeHistoryItems, setTradeHistoryItems] = React.useState<any>()
  const [holdingsItems, setHoldingsItems] = React.useState<any>()
  const [buyQuantity, setBuyQuantity] = useState(0)
  const [sellQuantity, setSellQuantity] = useState(0)
  const [selectedResult, setSelectedResult] = useState(null)
  const [selectedSimulator, setSelectedSimulator] = useState(null)

  const mockStockData = [
    { name: 'AAPL', company: 'Apple' },
    { name: 'TSLA', company: 'Telsa' },
    { name: 'MSFT', company: 'Microsoft' },
    { name: 'GOOG', company: 'Google' },
  ]

  const simulators = ['All Time', 'Monthly', 'Weekly']

  React.useEffect(() => {
    axios.get(route + 'account/user/' + String(user.email)).then((response) => {
      setUserItem(response.data)
    })
  }, [])

  function updateRows(data: any) {
    var trueAction = ''
    rows = []
    for (var i = 0; i < data.length; i++) {
      if (data[i].transactionType === 1) {
        trueAction = 'Buy'
      } else {
        trueAction = 'Sell'
      }
      rows.push({
        id: data[i]._id,
        date: data[i].transactionTime,
        action: trueAction,
        symbol: data[i].symbol,
        exchange: data[i].index,
        price: data[i].price,
        quantity: data[i].quantity,
      })
    }
  }

  function updateHoldingsRows(data: any) {
    holdingsRows = []
    for (var i = 0; i < data.length; i++) {
      holdingsRows.push({
        id: data[i]._id,
        symbol: data[i].symbol,
        // name: data[i].name,
        price: data[i].price,
        quantity: data[i].quantity,
        exchange: data[i].index,
      })
    }
  }

  const handleSimulatorChange = (event: any) => {
    var sim = String(event.target.value)
    setSelectedSimulator(event.target.value)

    if (
      sim &&
      userItem.simulatorEnrollments &&
      userItem.simulatorEnrollments.length > 0
    ) {
      for (var i = 0; i < userItem.simulatorEnrollments.length; i += 1) {
        if (sim === userItem.simulatorEnrollments[i].simulator.title) {
          simulatorExists = true
          simIndex = i
          break
        } else {
          simulatorExists = false
          simIndex = 0
        }
      }
    }

    if (simulatorExists) {
      axios
        .get(
          route +
            'game/tradeHistory/' +
            userItem.simulatorEnrollments[simIndex].simulator._id +
            '/' +
            String(user.email)
        )
        .then((response) => {
          setTradeHistoryItems(response.data)
          updateRows(response.data)
        })
    }

    if (simulatorExists) {
      axios
        .get(
          route +
            'game/holding/' +
            userItem.simulatorEnrollments[simIndex].simulator._id +
            '/' +
            String(user.email)
        )
        .then((response) => {
          setHoldingsItems(response.data)
          updateHoldingsRows(response.data)
        })
    }
  }

  const handleBuyInputChange = (event: any) => {
    setBuyQuantity(event.target.value)
  }

  const handleSellInputChange = (event: any) => {
    setSellQuantity(event.target.value)
  }

  const handleStockInputSubmit = (event: any) => {
    const selectedValue = event.target.value
    console.log(event)
    console.log(selectedValue)
    setSelectedResult(selectedValue)

    const currDate = new Date(Date.now())
    const stringDate = currDate.toISOString()
    const finalStr = stringDate.substring(0, stringDate.indexOf('T'))

    currDate.setFullYear(currDate.getFullYear() - 1)
    const newDate = currDate
    const stringNewDate = newDate.toISOString()

    const finalStr2 = stringNewDate.substring(0, stringNewDate.indexOf('T'))

    axios
      .get(
        'https://api.twelvedata.com/time_series?&start_date=' +
          finalStr2 +
          '&symbol=' +
          String(selectedValue) +
          `&interval=1month&apikey=${process.env.REACT_APP_FINBERRY_TWELVEDATA_API_KEY}`
      )
      .then((response) => {
        setChartItems(response.data)
        var saveData = response.data
        chartData = []
        if (saveData) {
          for (var i = saveData.values.length - 1; i >= 0; i--) {
            var temp = {
              date: String(saveData.values[i].datetime),
              price: Number(saveData.values[i].close),
            }
            chartData.push(temp)
          }
        }
        axios
          .get(
            'https://api.twelvedata.com/price?symbol=' +
              saveData.meta.symbol +
              `&apikey=${process.env.REACT_APP_FINBERRY_TWELVEDATA_API_KEY}`
          )
          .then((response) => {
            setRealTimePrice(response.data)
          })
      })
  }

  const handleBuyInputSubmit = (event: any) => {
    if (realTimePrice) {
      axios({
        method: 'post',
        url:
          route +
          'game/simulator/' +
          userItem.simulatorEnrollments[simIndex].simulator._id +
          '/' +
          String(user.email),
        headers: {},
        data: {
          symbol: chartItems.meta.symbol,
          index: chartItems.meta.exchange,
          transactionType: 1,
          quantity: buyQuantity,
          price: realTimePrice.price,
          transactionTime: Date.now(),
        },
      }).then((result: any) => {
        axios
          .get(route + 'account/user/' + String(user.email))
          .then((response) => {
            setUserItem(response.data)
            axios
              .get(
                route +
                  'game/tradeHistory/' +
                  userItem.simulatorEnrollments[simIndex].simulator._id +
                  '/' +
                  String(user.email)
              )
              .then((response) => {
                setTradeHistoryItems(response.data)
                updateRows(response.data)
              })
            axios
              .get(
                route +
                  'game/holding/' +
                  userItem.simulatorEnrollments[simIndex].simulator._id +
                  '/' +
                  String(user.email)
              )
              .then((response) => {
                setHoldingsItems(response.data)
                updateHoldingsRows(response.data)
              })
          })
      })
    }
  }

  const handleSellInputSubmit = (event: any) => {
    if (realTimePrice) {
      axios({
        method: 'post',
        url:
          route +
          'game/simulator/' +
          userItem.simulatorEnrollments[simIndex].simulator._id +
          '/' +
          String(user.email),
        headers: {},
        data: {
          symbol: chartItems.meta.symbol,
          index: chartItems.meta.exchange,
          transactionType: 2,
          quantity: sellQuantity,
          price: realTimePrice.price,
          transactionTime: Date.now(),
        },
      }).then((result: any) => {
        axios
          .get(route + 'account/user/' + String(user.email))
          .then((response) => {
            setUserItem(response.data)
            axios
              .get(
                route +
                  'game/tradeHistory/' +
                  userItem.simulatorEnrollments[simIndex].simulator._id +
                  '/' +
                  String(user.email)
              )
              .then((response) => {
                setTradeHistoryItems(response.data)
                updateRows(response.data)
              })
            axios
              .get(
                route +
                  'game/holding/' +
                  userItem.simulatorEnrollments[simIndex].simulator._id +
                  '/' +
                  String(user.email)
              )
              .then((response) => {
                setHoldingsItems(response.data)
                updateHoldingsRows(response.data)
              })
          })
      })
    }
  }

  const handleEnrollSubmit = (event: any) => {
    axios.get(route + 'game/simulator').then((response) => {
      for (var i = 0; i < response.data.length; i++) {
        if (selectedSimulator === response.data[i].title) {
          axios({
            method: 'post',
            url: route + 'game/simulator/' + response.data[i]._id,
            data: {
              email: String(user.email),
            },
          }).then((e: any) => {
            window.location.reload()
          })
        }
      }
    })
  }

  const [tab, setTab] = React.useState('buy')

  const handleChange = (event: React.SyntheticEvent, newTab: string) => {
    setTab(newTab)
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
          borderRadius: '3rem',
          boxShadow: '0 4px 15px -6px black',
          marginBottom: '1rem',
          paddingTop: '5rem',
          paddingBottom: '2rem',
          overflow: 'auto',
        }}
      >
        <Container maxWidth='xl' sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  mb: 0,
                }}
              >
                <Title>
                  {userItem
                    ? `Welcome to your simulator portfolio, ${userItem.username} ${userItem.lastName}!`
                    : `Welcome to your simulator portfolio!`}
                </Title>
                <Typography component='p' variant='body1'>
                  Select a simulator:
                </Typography>
                {simulators.length > 0 && (
                  <select
                    id='sim-results'
                    value={selectedSimulator || ''}
                    onChange={handleSimulatorChange}
                  >
                    <option value='' disabled hidden>
                      ---
                    </option>
                    {simulators.map((item) => (
                      <option>{item}</option>
                    ))}
                  </select>
                )}
                {selectedSimulator && !simulatorExists ? (
                  <Button
                    size='small'
                    sx={{
                      backgroundColor: 'secondary.main',
                      color: 'white',
                      width: '6rem',
                      mt: '1rem',
                      '&:hover': {
                        backgroundColor: 'secondary.dark',
                      },
                    }}
                    onClick={handleEnrollSubmit}
                    component={Link}
                    to='/SimulatorPortfolio'
                  >
                    Enroll Now
                  </Button>
                ) : (
                  <></>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6} lg={8}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 240,
                }}
              >
                <Chart data={chartData} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={3} lg={2}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 240,
                }}
              >
                <Balance
                  title='Buying Power'
                  amount={
                    selectedSimulator && simulatorExists
                      ? userItem.simulatorEnrollments[simIndex].balance
                      : 0
                  }
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={3} lg={2}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 240,
                }}
              >
                <Balance
                  title='Portfolio Value'
                  amount={
                    selectedSimulator && simulatorExists
                      ? userItem.simulatorEnrollments[simIndex].balance
                      : 0
                  }
                />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                {selectedSimulator && simulatorExists ? (
                  <Holdings data={holdingsRows} />
                ) : (
                  <Holdings data={undefined} />
                )}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                {selectedSimulator && simulatorExists ? (
                  <Orders data={rows} />
                ) : (
                  <Orders data={undefined} />
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Container>
      {selectedSimulator && simulatorExists ? (
        <Container
          sx={{
            backgroundColor: 'white',
            minHeight: '50vh',
            minWidth: '100%',
            display: 'flex',
            marginTop: '1rem',
            marginBottom: '1rem',
            padding: '2rem',
          }}
        >
          <Grid
            container
            sx={{
              display: 'flex',
            }}
          >
            <Grid xs={12}>
              <Typography
                component='div'
                variant='h3'
                align='left'
                fontWeight={400}
                sx={{ color: 'text.primary', marginBottom: '1rem' }}
              >
                <Typography variant='h4' align='left' fontWeight={50}>
                  Simulate a trade.
                </Typography>
              </Typography>
              <Box sx={{ width: '100%' }}>
                <TabContext value={tab}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList
                      onChange={handleChange}
                      textColor='secondary'
                      indicatorColor='secondary'
                      aria-label='simulate trade tabs'
                      variant='fullWidth'
                    >
                      <Tab label='Buy' value='buy' />
                      <Tab label='Sell' value='sell' />
                    </TabList>
                  </Box>
                  <TabPanel value='buy'>
                    <Grid container>
                      <Grid
                        lg={6}
                        xs={12}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          padding: {
                            lg: '2rem',
                            xs: '0rem',
                          },
                        }}
                      >
                        <TextField
                          required
                          id='buy-input'
                          name='stock'
                          label='Stock Name'
                          type='text'
                          margin='normal'
                          sx={{
                            width: '100%',
                          }}
                          color='primary'
                        />
                        <TextField
                          required
                          id='buy-input'
                          name='quantity'
                          label='Quantity'
                          type='number'
                          value={buyQuantity}
                          onChange={handleBuyInputChange}
                          margin='normal'
                          sx={{
                            width: '100%',
                          }}
                          InputProps={{
                            inputProps: {
                              max: 100,
                              min: 1,
                            },
                          }}
                          color='primary'
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
                          onClick={handleBuyInputSubmit}
                        >
                          Buy
                        </Button>
                      </Grid>
                    </Grid>
                  </TabPanel>
                  <TabPanel value='sell'>
                    <Grid container>
                      <Grid
                        lg={6}
                        xs={12}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          padding: {
                            lg: '2rem',
                            xs: '0rem',
                          },
                        }}
                      >
                        <Autocomplete
                          id='sell-stock-input'
                          onChange={handleStockInputSubmit}
                          options={mockStockData}
                          getOptionLabel={(option) => option.name}
                          value={this}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              required
                              id='sell-input'
                              name='stock'
                              label='Stock Name'
                              type='text'
                              margin='normal'
                              sx={{
                                width: '100%',
                              }}
                              color='primary'
                            />
                          )}
                        />
                        <TextField
                          required
                          id='sell-input'
                          name='quantity'
                          label='Quantity'
                          type='number'
                          value={sellQuantity}
                          onChange={handleSellInputChange}
                          margin='normal'
                          sx={{
                            width: '100%',
                          }}
                          InputProps={{
                            inputProps: {
                              max: 100,
                              min: 1,
                            },
                          }}
                          color='primary'
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
                          onClick={handleSellInputSubmit}
                        >
                          Sell
                        </Button>
                      </Grid>
                      {selectedSimulator && simulatorExists ? (
                        <Grid
                          lg={6}
                          xs={12}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            padding: {
                              lg: '2rem',
                              xs: '0rem',
                            },
                          }}
                        >
                          {mockStockData.length > 0 && (
                            <div>
                              <select
                                id='stock-search-results'
                                value={selectedResult || ''}
                                onChange={handleStockInputSubmit}
                              >
                                <option value='' disabled hidden>
                                  Select an option
                                </option>
                                {mockStockData.map((item) => (
                                  <option key={item.name} value={item.name}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          <Typography variant='body1' fontWeight={400}>
                            The price of ${chartItems?.meta.symbol} since{' '}
                            {chartData[0]?.date}
                          </Typography>
                          <Paper
                            sx={{
                              p: 2,
                              display: 'flex',
                              flexDirection: 'column',
                              height: 240,
                            }}
                          >
                            <Chart data={chartData} />
                          </Paper>
                        </Grid>
                      ) : (
                        <></>
                      )}
                    </Grid>
                  </TabPanel>
                </TabContext>
              </Box>
            </Grid>

            {selectedSimulator && simulatorExists && chartData.length > 0 ? (
              <Grid
                xs={12}
                lg={6}
                sx={{ paddingTop: { xs: '2rem', lg: '0rem' } }}
              ></Grid>
            ) : (
              <></>
            )}
          </Grid>
        </Container>
      ) : (
        <></>
      )}
    </div>
  )
}

export default SimulatorPortfolioPage
