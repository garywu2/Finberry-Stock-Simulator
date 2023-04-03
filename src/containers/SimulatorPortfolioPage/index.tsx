import {
  Autocomplete,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
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
var simulators: any[] = []

const SimulatorPortfolioPage = () => {
  const { user } = useContext(UserContext)

  const [userItem, setUserItem] = React.useState<any>([])
  const [chartItems, setChartItems] = React.useState<any>()
  const [portfolioValue, setPortfolioValue] = React.useState<any>()
  const [realTimePrice, setRealTimePrice] = React.useState<any>(0)
  const [tradeHistoryItems, setTradeHistoryItems] = React.useState<any>()
  const [holdingsItems, setHoldingsItems] = React.useState<any>()
  const [buyQuantity, setBuyQuantity] = useState(0)
  const [sellQuantity, setSellQuantity] = useState(0)
  const [selectedResult, setSelectedResult] = useState<any>(null)
  const [selectedSimulator, setSelectedSimulator] = useState(null)
  const [mockStockData, setMockStockData] = React.useState<any>([])
  const [error, setError] = useState('')
  const [openBuy, setOpenBuy] = React.useState(false)
  const [openSell, setOpenSell] = React.useState(false)
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))

  const handleCloseBuy = (event: any) => {
    setOpenBuy(false)
  }

  const handleCancelBuy = () => {
    setOpenBuy(false)
  }

  const handleClickOpenBuy = (e: any) => {
    if (realTimePrice && buyQuantity > 0) {
      setOpenBuy(true)
    } else {
      setError('One or more required fields are empty.')
    }
  }

  const handleCloseSell = (event: any) => {
    setOpenSell(false)
  }

  const handleCancelSell = () => {
    setOpenSell(false)
  }

  const handleClickOpenSell = (e: any) => {
    if (realTimePrice && sellQuantity > 0) {
      setOpenSell(true)
    } else {
      setError('One or more required fields are empty.')
    }
  }

  React.useEffect(() => {
    axios.get(route + 'stock/stocks').then((response) => {
      setMockStockData(response?.data)
    })

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

    simulators = []
    axios.get(route + 'game/simulator').then((response) => {
      console.log(response)
      for (var i = 0; i < response?.data?.length; i++) {
        simulators.push(response.data[i].title)
      }
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
        price: data[i].stockPrice,
        totalValue: data[i].totalValue,
        quantity: data[i].quantity,
        exchange: data[i].index,
        avgPrice: data[i].averagePurchasePrice,
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
    setError('')

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
              greaterThanZero: true,
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
    setError('')
  }

  const handleSellInputChange = (event: any) => {
    setSellQuantity(event.target.value)
    setError('')
  }

  const handleStockInputSubmit = (event: any, value: any) => {
    const selectedValue = value?.symbol
    setSelectedResult(value)

    const currDate = new Date(Date.now())
    const stringDate = currDate.toISOString()
    const finalStr = stringDate.substring(0, stringDate.indexOf('T'))

    currDate.setFullYear(currDate.getFullYear() - 1)
    const newDate = currDate
    const stringNewDate = newDate.toISOString()

    const finalStr2 = stringNewDate.substring(0, stringNewDate.indexOf('T'))

    trackPromise(
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
          setError('')
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
        }),
      areas.simulatorPortfolioStockData
    )
    axios
    .get(route + 'stock/price', {
      params: {
        symbol: value?.symbol,
      },
    })
    .then((response) => {
      setRealTimePrice(response.data)
    })
  }

  const handleBuyInputSubmit = (event: any) => {
    if (realTimePrice && buyQuantity > 0) {
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
        setError('')
        setOpenBuy(false)
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
                  greaterThanZero: true,
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
    } else {
      setError('One or more required fields are empty')
    }
  }

  const handleSellInputSubmit = (event: any) => {
    if (realTimePrice && sellQuantity > 0) {
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
        setError('')
        setOpenSell(false)
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
                  greaterThanZero: true,
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
    } else {
      setError('One or more required fields are empty')
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
                      <option key={item}>{item}</option>
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
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <Title>Trade Simulator</Title>
                <Dialog
                  fullScreen={fullScreen}
                  open={openBuy}
                  onClose={handleCloseBuy}
                  fullWidth={true}
                  maxWidth='lg'
                >
                  <DialogTitle>Trade Summary</DialogTitle>
                  <DialogContent>
                    <Table aria-label='stock info table'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Stock</TableCell>
                          <TableCell align='right'>
                            {chartItems?.meta.symbol}
                            <Spinner area={areas.simulatorPortfolioStockData} />
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Price</TableCell>
                          <TableCell align='right'>
                            $
                            {isNaN(realTimePrice?.price * 1)
                              ? 0
                              : (realTimePrice?.price * 1)?.toLocaleString(
                                  undefined,
                                  {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 2,
                                  }
                                )}
                            <Spinner area={areas.simulatorPortfolioStockData} />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Quantity</TableCell>
                          <TableCell align='right'>{buyQuantity}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Order Cost</TableCell>
                          <TableCell align='right'>
                            $
                            {isNaN(realTimePrice?.price * buyQuantity)
                              ? 0
                              : (
                                  realTimePrice?.price * buyQuantity
                                )?.toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                  minimumFractionDigits: 2,
                                })}
                            <Spinner area={areas.simulatorPortfolioStockData} />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      size='medium'
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
                      Confirm
                    </Button>{' '}
                    <Button onClick={handleCancelBuy}>Cancel</Button>
                  </DialogActions>
                </Dialog>
                <Dialog
                  fullScreen={fullScreen}
                  open={openSell}
                  onClose={handleCloseSell}
                  fullWidth={true}
                  maxWidth='lg'
                >
                  <DialogTitle>Trade Summary</DialogTitle>
                  <DialogContent>
                    <Table aria-label='stock info table'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Stock</TableCell>
                          <TableCell align='right'>
                            {chartItems?.meta.symbol}
                            <Spinner area={areas.simulatorPortfolioStockData} />
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Price</TableCell>
                          <TableCell align='right'>
                            $
                            {isNaN(realTimePrice?.price * 1)
                              ? 0
                              : (realTimePrice?.price * 1)?.toLocaleString(
                                  undefined,
                                  {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 2,
                                  }
                                )}
                            <Spinner area={areas.simulatorPortfolioStockData} />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Quantity</TableCell>
                          <TableCell align='right'>
                            {sellQuantity}
                            <Spinner area={areas.simulatorPortfolioStockData} />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Order Value</TableCell>
                          <TableCell align='right'>
                            $
                            {isNaN(realTimePrice?.price * sellQuantity)
                              ? 0
                              : (
                                  realTimePrice?.price * sellQuantity
                                )?.toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                  minimumFractionDigits: 2,
                                })}
                            <Spinner area={areas.simulatorPortfolioStockData} />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      size='medium'
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
                      Confirm
                    </Button>{' '}
                    <Button onClick={handleCancelSell}>Cancel</Button>
                  </DialogActions>
                </Dialog>
                {selectedSimulator && simulatorExists ? (
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
                            item
                            lg={3}
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
                              getOptionLabel={(option) => option.symbol}
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
                              onClick={handleClickOpenBuy}
                            >
                              Buy
                            </Button>
                            {error && (
                              <Typography color='red'>{error}</Typography>
                            )}
                          </Grid>
                          <Grid
                            item
                            lg={3}
                            xs={12}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              padding: {
                                lg: '2.5rem',
                                xs: '1rem 0rem',
                              },
                            }}
                          >
                            <TableContainer component={Paper}>
                              <Table aria-label='stock info table'>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Stock</TableCell>
                                    <TableCell align='right'>
                                      {chartItems?.meta.symbol}
                                      <Spinner
                                        area={areas.simulatorPortfolioStockData}
                                      />
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>Price</TableCell>
                                    <TableCell align='right'>
                                      $
                                      {isNaN(realTimePrice?.price * 1)
                                        ? 0
                                        : (
                                            realTimePrice?.price * 1
                                          )?.toLocaleString(undefined, {
                                            maximumFractionDigits: 2,
                                            minimumFractionDigits: 2,
                                          })}
                                      <Spinner
                                        area={areas.simulatorPortfolioStockData}
                                      />
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>Order Cost</TableCell>
                                    <TableCell align='right'>
                                      $
                                      {isNaN(realTimePrice?.price * buyQuantity)
                                        ? 0
                                        : (
                                            realTimePrice?.price * buyQuantity
                                          )?.toLocaleString(undefined, {
                                            maximumFractionDigits: 2,
                                            minimumFractionDigits: 2,
                                          })}
                                      <Spinner
                                        area={areas.simulatorPortfolioStockData}
                                      />
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>Buying Power</TableCell>
                                    <TableCell align='right'>
                                      $
                                      {selectedSimulator &&
                                      simulatorExists &&
                                      userItem.simulatorEnrollments
                                        ? userItem.simulatorEnrollments[
                                            simIndex
                                          ]?.balance?.toLocaleString(
                                            undefined,
                                            {
                                              maximumFractionDigits: 2,
                                              minimumFractionDigits: 2,
                                            }
                                          )
                                        : 0}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Grid>
                          {selectedSimulator &&
                          simulatorExists &&
                          selectedResult ? (
                            <Grid
                              item
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
                            item
                            lg={3}
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
                              options={holdingsItems}
                              value={selectedResult}
                              getOptionLabel={(option) => option.symbol}
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
                              onClick={handleClickOpenSell}
                            >
                              Sell
                            </Button>
                            {error && (
                              <Typography color='red'>{error}</Typography>
                            )}
                          </Grid>
                          <Grid
                            item
                            lg={3}
                            xs={12}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              padding: {
                                lg: '2.5rem',
                                xs: '1rem 0rem',
                              },
                            }}
                          >
                            <TableContainer component={Paper}>
                              <Table aria-label='stock info table'>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Stock</TableCell>
                                    <TableCell align='right'>
                                      {chartItems?.meta.symbol}
                                      <Spinner
                                        area={areas.simulatorPortfolioStockData}
                                      />
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>Price</TableCell>
                                    <TableCell align='right'>
                                      $
                                      {isNaN(realTimePrice?.price * 1)
                                        ? 0
                                        : (
                                            realTimePrice?.price * 1
                                          )?.toLocaleString(undefined, {
                                            maximumFractionDigits: 2,
                                            minimumFractionDigits: 2,
                                          })}
                                      <Spinner
                                        area={areas.simulatorPortfolioStockData}
                                      />
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>Order Cost</TableCell>
                                    <TableCell align='right'>
                                      $
                                      {isNaN(
                                        realTimePrice?.price * sellQuantity
                                      )
                                        ? 0
                                        : (
                                            realTimePrice?.price * sellQuantity
                                          )?.toLocaleString(undefined, {
                                            maximumFractionDigits: 2,
                                            minimumFractionDigits: 2,
                                          })}
                                      <Spinner
                                        area={areas.simulatorPortfolioStockData}
                                      />
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Grid>

                          {selectedSimulator &&
                          simulatorExists &&
                          selectedResult ? (
                            <Grid
                              item
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
                ) : (
                  <Typography>Select a simulator to begin.</Typography>
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
    </div>
  )
}

export default SimulatorPortfolioPage
