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
import { trackPromise } from 'react-promise-tracker'

import Title from '../../components/Title'
import Chart from '../../components/Chart'
import Balance from '../../components/Balance'
import Holdings from '../../components/Holdings'
import Orders from '../../components/Orders'
import UserContext from '../../context/user'
import Spinner from '../../components/Spinner'
import { areas } from '../../constants/areas'

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
  const [portfolioValue, setPortfolioValue] = React.useState<any>()
  const [realTimePrice, setRealTimePrice] = React.useState<any>()
  const [tradeHistoryItems, setTradeHistoryItems] = React.useState<any>()
  const [holdingsItems, setHoldingsItems] = React.useState<any>()
  const [buyQuantity, setBuyQuantity] = useState(0)
  const [sellQuantity, setSellQuantity] = useState(0)
  const [selectedResult, setSelectedResult] = useState<any>(null)
  const [selectedSimulator, setSelectedSimulator] = useState(null)

  const mockStockData = [
    { name: 'AAPL', company: 'Apple' },
    { name: 'TSLA', company: 'Telsa' },
    { name: 'MSFT', company: 'Microsoft' },
    { name: 'GOOG', company: 'Google' },
  ]

  const simulators = ['All Time', 'Monthly', 'Weekly']

  React.useEffect(() => {
    trackPromise(
      axios
        .get(route + 'account/user', {
          params: {
            email: String(user.email),
            moreDetails: true,
          },
        })
        .then((response) => {
          setUserItem(response.data[0])
        }),
      areas.simulatorPortfolioUserInfo
    )
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
        price: data[i].stockPrice,
        totalValue: data[i].totalValue,
        quantity: data[i].quantity,
        exchange: data[i].index,
      })
    }
  }

  const handleSimulatorChange = (event: any) => {
    var sim = String(event.target.value)
    setSelectedSimulator(event.target.value)
    setHoldingsItems([])
    updateHoldingsRows([])
    setTradeHistoryItems([])
    updateRows([])

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

    if (simulatorExists && userItem.simulatorEnrollments) {
      trackPromise(
        axios
          .get(route + 'game/tradeTransaction', {
            params: {
              email: String(user.email),
              simulatorID:
                userItem.simulatorEnrollments[simIndex].simulator._id,
            },
          })
          .then((response) => {
            setTradeHistoryItems(response.data)
            updateRows(response.data)
          }),
        areas.simulatorPortfolioTradeHistory
      )
    }

    if (simulatorExists && userItem.simulatorEnrollments) {
      trackPromise(
        axios
          .get(route + 'game/holding', {
            params: {
              email: String(user.email),
              simulatorID:
                userItem.simulatorEnrollments[simIndex].simulator._id,
              populatePriceAndValue: true,
            },
          })
          .then((response) => {
            setHoldingsItems(response.data)
            updateHoldingsRows(response.data)
          }),
        areas.simulatorPortfolioHoldings
      )
    }

    if (simulatorExists && userItem.simulatorEnrollments) {
      axios({
        method: 'get',
        url:
          route +
          'game/balancecalculation/balance/simulatoremail/' +
          userItem.simulatorEnrollments[simIndex].simulator._id +
          '/' +
          userItem.email,
      }).then((resp) => {
        setPortfolioValue(resp.data.stockBalance + resp.data.cashBalance)
      })
    }
  }

  const handleBuyInputChange = (event: any) => {
    setBuyQuantity(event.target.value)
  }

  const handleSellInputChange = (event: any) => {
    setSellQuantity(event.target.value)
  }

  const handleStockInputSubmit = (event: any, value: any) => {
    const selectedValue = value.name
    setSelectedResult(value)

    const currDate = new Date(Date.now())
    const stringDate = currDate.toISOString()
    const finalStr = stringDate.substring(0, stringDate.indexOf('T'))

    currDate.setFullYear(currDate.getFullYear() - 1)
    const newDate = currDate
    const stringNewDate = newDate.toISOString()

    const finalStr2 = stringNewDate.substring(0, stringNewDate.indexOf('T'))

    axios
      .get(route + 'stock/time_series', {
        params: {
          symbol: String(selectedValue),
          interval: '1week',
          start_date: finalStr2,
          outputsize: '60',
        },
      })
      .then((response) => {
        setChartItems(response.data.data)
        var saveData = response.data.data
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
          .get(route + 'stock/price', {
            params: {
              symbol: saveData.meta.symbol,
            },
          })
          .then((response) => {
            setRealTimePrice(response.data.data)
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
          .get(route + 'account/user', {
            params: {
              email: String(user.email),
              moreDetails: true,
            },
          })
          .then((response) => {
            setUserItem(response.data[0])
            axios
              .get(route + 'game/tradeTransaction', {
                params: {
                  email: String(user.email),
                  simulatorID:
                    userItem.simulatorEnrollments[simIndex].simulator._id,
                },
              })
              .then((response) => {
                setTradeHistoryItems(response.data)
                updateRows(response.data)
              })
            axios
              .get(route + 'game/holding', {
                params: {
                  email: String(user.email),
                  simulatorID:
                    userItem.simulatorEnrollments[simIndex].simulator._id,
                  populatePriceAndValue: true,
                },
              })
              .then((response) => {
                setHoldingsItems(response.data)
                updateHoldingsRows(response.data)
              })

            axios({
              method: 'get',
              url:
                route +
                'game/balancecalculation/balance/simulatoremail/' +
                userItem.simulatorEnrollments[simIndex].simulator._id +
                '/' +
                userItem.email,
            }).then((resp) => {
              setPortfolioValue(resp.data.stockBalance + resp.data.cashBalance)
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
          .get(route + 'account/user', {
            params: {
              email: String(user.email),
              moreDetails: true,
            },
          })
          .then((response) => {
            setUserItem(response.data[0])
            axios
              .get(route + 'game/tradeTransaction', {
                params: {
                  email: String(user.email),
                  simulatorID:
                    userItem.simulatorEnrollments[simIndex].simulator._id,
                },
              })
              .then((response) => {
                setTradeHistoryItems(response.data)
                updateRows(response.data)
              })
            axios
              .get(route + 'game/holding', {
                params: {
                  email: String(user.email),
                  simulatorID:
                    userItem.simulatorEnrollments[simIndex].simulator._id,
                  populatePriceAndValue: true,
                },
              })
              .then((response) => {
                setHoldingsItems(response.data)
                updateHoldingsRows(response.data)
              })

            axios({
              method: 'get',
              url:
                route +
                'game/balancecalculation/balance/simulatoremail/' +
                userItem.simulatorEnrollments[simIndex].simulator._id +
                '/' +
                userItem.email,
            }).then((resp) => {
              setPortfolioValue(resp.data.stockBalance + resp.data.cashBalance)
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
                  {userItem?.username ? (
                    `Welcome to your simulator portfolio, ${userItem.username}!`
                  ) : (
                    <Spinner area={areas.simulatorPortfolioUserInfo} />
                  )}
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
                    selectedSimulator &&
                    simulatorExists &&
                    userItem.simulatorEnrollments
                      ? userItem.simulatorEnrollments[simIndex]?.balance
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
                    selectedSimulator &&
                    simulatorExists &&
                    userItem.simulatorEnrollments &&
                    portfolioValue
                      ? portfolioValue
                      : 0
                  }
                />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                {selectedSimulator && simulatorExists ? (
                  <>
                    <Holdings data={holdingsRows} />
                  </>
                ) : (
                  <Holdings data={undefined} />
                )}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                {selectedSimulator && simulatorExists ? (
                  <>
                    <Orders data={rows} />
                  </>
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
              <Typography variant='h4' align='left' fontWeight={50}>
                Simulate a trade.
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
                  <TabPanel value='buy' sx={{ padding: '0rem' }}>
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
                          id='buy-stock-input'
                          onChange={(event, newValue) => {
                            handleStockInputSubmit(event, newValue)
                          }}
                          options={mockStockData}
                          value={selectedResult}
                          getOptionLabel={(option) => option.name}
                          renderInput={(params) => (
                            <TextField
                              {...params}
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
                          )}
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
                      {selectedSimulator &&
                      simulatorExists &&
                      selectedResult ? (
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
                  <TabPanel value='sell' sx={{ padding: '0rem' }}>
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
                          onChange={(event, newValue) => {
                            handleStockInputSubmit(event, newValue)
                          }}
                          options={mockStockData}
                          value={selectedResult}
                          getOptionLabel={(option) => option.name}
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
                      {selectedSimulator &&
                      simulatorExists &&
                      selectedResult ? (
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
          </Grid>
        </Container>
      ) : (
        <></>
      )}
    </div>
  )
}

export default SimulatorPortfolioPage
