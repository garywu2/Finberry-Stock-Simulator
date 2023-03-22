import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import Title from '../../components/Title'
import { TableContainer } from '@mui/material'
import { Link } from 'react-router-dom'
import React, { useContext, useState } from 'react'
import axios from 'axios'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import UserContext from '../../context/user'
import { Navigate, useNavigate } from 'react-router-dom'

import Chart from '../../components/Chart'
import Balance from '../../components/Balance'
import Orders from '../../components/Orders'

const route =
  process.env.REACT_APP_FINBERRY_DEVELOPMENT === 'true'
    ? 'http://localhost:5000/'
    : 'https://finberry-stock-simulator-server.vercel.app/'

var simulatorExists = false
var simIndex = 0
var rows: any[] = []
var chartData: any[] = []
var currSimId = 0

const SimulatorPortfolioPage = () => {
  const { user } = useContext(UserContext)

  const [userItem, setUserItem] = React.useState<any>([])
  const [chartItems, setChartItems] = React.useState<any>()
  const [realTimePrice, setRealTimePrice] = React.useState<any>()
  const [tradeHistoryItems, setTradeHistoryItems] = React.useState<any>()
  const [stockSearchTerm, setStockSearchTerm] = useState('')
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

  const filteredStockData = mockStockData.filter((item) =>
    item.name.toLowerCase().includes(stockSearchTerm.toLowerCase())
  )

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
      if (data[i].transactionType == 1) {
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

  const handleSimulatorChange = (event: any) => {
    var sim = String(event.target.value)
    setSelectedSimulator(event.target.value)

    if (
      sim &&
      userItem.simulatorEnrollments &&
      userItem.simulatorEnrollments.length > 0
    ) {
      for (var i = 0; i < userItem.simulatorEnrollments.length; i += 1) {
        if (sim == userItem.simulatorEnrollments[i].simulator.title) {
          simulatorExists = true
          simIndex = i
          currSimId = userItem.simulatorEnrollments[i].simulator._id
        } else {
          simulatorExists = false
          simIndex = 0
          currSimId = 0
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
  }

  const handleBuyInputChange = (event: any) => {
    setBuyQuantity(event.target.value)
  }

  const handleSellInputChange = (event: any) => {
    setSellQuantity(event.target.value)
  }

  const handleStockInputChange = (event: any) => {
    setStockSearchTerm(event.target.value)
    setSelectedResult(null)
  }

  const handleStockInputSubmit = (event: any) => {
    const selectedValue = event.target.value
    setSelectedResult(selectedValue)
    setStockSearchTerm(selectedValue)

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
          })
      })
    }
  }

  const handleEnrollSubmit = (event: any) => {
    axios.get(route + 'game/simulator').then((response) => {
      for (var i = 0; i < response.data.length; i++) {
        if (selectedSimulator == response.data[i].title) {
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

  function preventDefault(event: React.MouseEvent) {
    event.preventDefault()
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
        <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
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
                  Welcome to your simulator portfolio, {userItem.username}{' '}
                  {userItem.lastName}
                </Title>
              </Paper>
            </Grid>
            <Grid item xs={12} md={8} lg={9}>
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
            <Grid item xs={12} md={4} lg={3}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 240,
                }}
              >
                <Balance />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                <Orders />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Container>
      {userItem ? (
        <h1>
          Welcome to your Simulator Profile, {userItem.firstName}{' '}
          {userItem.lastName}
        </h1>
      ) : (
        <h1>error reading your name</h1>
      )}

      {simulators.length > 0 && (
        <div>
          <label htmlFor='sim-results'>Simulator: </label>
          <select
            id='sim-results'
            value={selectedSimulator || ''}
            onChange={handleSimulatorChange}
          >
            <option value='' disabled hidden>
              Select a simulator
            </option>
            {simulators.map((item) => (
              <option>{item}</option>
            ))}
          </select>
        </div>
      )}

      {selectedSimulator && !simulatorExists ? (
        <Button
          size='small'
          sx={{
            backgroundColor: 'secondary.main',
            color: 'white',
            marginY: '1rem',
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
        <p></p>
      )}

      {selectedSimulator && simulatorExists ? (
        <p>
          Your account balance:{' '}
          {userItem.simulatorEnrollments[simIndex].balance}
        </p>
      ) : (
        <p></p>
      )}

      {selectedSimulator && simulatorExists ? (
        <div>
          <label htmlFor='stock-search-input'>Search:</label>
          <input
            id='stock-search-input'
            type='text'
            value={stockSearchTerm}
            onChange={handleStockInputChange}
          />
          {filteredStockData.length > 0 && (
            <div>
              <label htmlFor='stock-search-results'>Results:</label>
              <select
                id='stock-search-results'
                value={selectedResult || ''}
                onChange={handleStockInputSubmit}
              >
                <option value='' disabled hidden>
                  Select an option
                </option>
                {filteredStockData.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      ) : (
        <p></p>
      )}

      {selectedSimulator && simulatorExists && chartData.length > 0 ? (
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
            The price of ${chartItems.meta.symbol} since {chartData[0].date}
          </Typography>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
              width: 1200,
              backgroundColor: 'white',
              minHeight: '100vh',
              minWidth: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '1rem',
              marginBottom: '1rem',
            }}
          >
            <Chart data={chartData} />
          </Paper>
          <Typography variant='h4' align='center' fontWeight={50}>
            Place an order:
          </Typography>

          <TextField
            required
            id='buy-input'
            label='Enter shares'
            variant='outlined'
            type='number'
            InputProps={{
              inputProps: {
                max: 100,
                min: 1,
              },
            }}
            value={buyQuantity}
            onChange={handleBuyInputChange}
          />
          <Button
            size='small'
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
            Buy {chartItems.meta.symbol}
          </Button>

          <TextField
            required
            id='sell-input'
            label='Enter shares'
            variant='outlined'
            type='number'
            InputProps={{
              inputProps: {
                max: 100,
                min: 1,
              },
            }}
            value={sellQuantity}
            onChange={handleSellInputChange}
          />
          <Button
            size='small'
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
            Sell {chartItems.meta.symbol}
          </Button>
        </Container>
      ) : (
        <p></p>
      )}

      {selectedSimulator && simulatorExists ? (
        <TableContainer>
          <Title>Recent Orders</Title>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Symbol</TableCell>
                <TableCell>Exchange</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell align='right'>Trade Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.action}</TableCell>
                  <TableCell>{row.symbol}</TableCell>
                  <TableCell>{row.exchange}</TableCell>
                  <TableCell>{`$${row.price}`}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell align='right'>{`$${
                    row.price * row.quantity
                  }`}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Link
            color='primary'
            to={'/'}
            style={{ margin: '2rem 0' }}
            onClick={preventDefault}
          >
            See more orders
          </Link>
        </TableContainer>
      ) : (
        <p></p>
      )}
    </div>
  )
}

export default SimulatorPortfolioPage
