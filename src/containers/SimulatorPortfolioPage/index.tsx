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
import React, {useContext, useState} from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import UserContext from "../../context/user";
import { Navigate, useNavigate } from "react-router-dom";
import Chart from '../../components/Chart';
const route = process.env.REACT_APP_FINBERRY_DEVELOPMENT === "true" ? 'http://localhost:5000/' : "https://finberry-stock-simulator-server.vercel.app/"; 

const SimulatorPortfolioPage = () => {
    const { user } = useContext(UserContext);

    const [userItem, setUserItem] = React.useState<any>([]);
    const [chartItems, setChartItems] = React.useState<any>();
    const [realTimePrice, setRealTimePrice] = React.useState<any>();
    const [stockSearchTerm, setStockSearchTerm] = useState('');
    const [buyQuantity, setBuyQuantity] = useState(0);
    const [sellQuantity, setSellQuantity] = useState(0);
    const [selectedResult, setSelectedResult] = useState(null);
    const [selectedSimulator, setSelectedSimulator] = useState(null);

    const mockStockData = [
        { name: "AAPL", company: "Apple" },
        { name: "TSLA", company: "Telsa" },
        { name: "MSFT", company: "Microsoft" },
        { name: "GOOG", company: "Google" },
    ];

    const filteredStockData = mockStockData.filter((item) =>
      item.name.toLowerCase().includes(stockSearchTerm.toLowerCase())
    );

    const simulators = ['All Time', 'Monthly', 'Weekly']

    var chartData = []
    if (chartItems) {
        for (var i = chartItems.values.length - 1; i >= 0; i--) {
            var temp = { date: String(chartItems.values[i].datetime), price: Number(chartItems.values[i].close) };
            chartData.push(temp)
        }
    }

    var simulatorExists = false;
    var simIndex = 0;
    if (selectedSimulator && userItem.simulatorEnrollments && userItem.simulatorEnrollments.length > 0) {
        for(var i = 0; i < userItem.simulatorEnrollments.length; i += 1) {
            if (selectedSimulator == userItem.simulatorEnrollments[i].simulator.title){
                simulatorExists = true;
                simIndex = i;
            }
        }
    }

    React.useEffect(() => {
        axios.get(route + 'account/user/' + String(user.email)).then((response) => {
            setUserItem(response.data);
        });
    }, []);

    const handleSimulatorChange = (event: any) => {
        setSelectedSimulator(event.target.value);
    };

    const handleBuyInputChange = (event: any) => {
        setBuyQuantity(event.target.value);
    }

    const handleSellInputChange = (event: any) => {
        setSellQuantity(event.target.value);
    }
  
    const handleStockInputChange = (event: any) => {
        setStockSearchTerm(event.target.value);
        setSelectedResult(null);
    };
  
    const handleStockInputSubmit = (event: any) => {
        const selectedValue = event.target.value;
        setSelectedResult(selectedValue);
        setStockSearchTerm(selectedValue);
        
        const currDate = new Date(Date.now());
        const stringDate = currDate.toISOString();
        const finalStr = stringDate.substring(0, stringDate.indexOf('T'));
        
        currDate.setFullYear(currDate.getFullYear() - 1)
        const newDate = currDate;
        const stringNewDate = newDate.toISOString();
        
        const finalStr2 = stringNewDate.substring(0, stringNewDate.indexOf('T'));

        axios.get('https://api.twelvedata.com/time_series?&start_date=' + finalStr2 + '&symbol=' + String(selectedValue) + '&interval=1month&apikey=bda95123e0344a5ba4e148064a3eabea').then((response) => {
            setChartItems(response.data)
            var saveData = response.data;
            axios.get('https://api.twelvedata.com/price?symbol=' + saveData.meta.symbol + '&apikey=bda95123e0344a5ba4e148064a3eabea').then((response) => {
            setRealTimePrice(response.data);
        });
        });
        
        
    };

    const handleBuyInputSubmit = (event: any) => {
        if(realTimePrice) {
            axios({
                method: 'post',
                url:  route + 'game/simulator/' + userItem.simulatorEnrollments[simIndex].simulator._id + '/' + String(user.email) ,
                headers: {},
                data: {
                    "symbol": chartItems.meta.symbol,
                    "index": chartItems.meta.exchange,
                    "transactionType": 1,
                    "quantity": buyQuantity,
                    "price": realTimePrice.price,
                    "transactionTime": Date.now()
                }
            }).then((result: any) => {
                axios.get(route + 'account/user/' + String(user.email)).then((response) => {
                setUserItem(response.data);
                });
            });
        }
    }

    const handleSellInputSubmit = (event: any) => {
        if(realTimePrice) {
            axios({
                method: 'post',
                url:  route + 'game/simulator/' + userItem.simulatorEnrollments[simIndex].simulator._id + '/' + String(user.email) ,
                headers: {},
                data: {
                    "symbol": chartItems.meta.symbol,
                    "index": chartItems.meta.exchange,
                    "transactionType": 2,
                    "quantity": sellQuantity,
                    "price": realTimePrice.price,
                    "transactionTime": Date.now()
                }
            })
            .then((result: any) => {
                axios.get(route + 'account/user/' + String(user.email)).then((response) => {
                    setUserItem(response.data);
                });
            });
        }
    }

    const handleEnrollSubmit = (event: any) => {
        axios({
            method: 'post',
            url: route + 'game/simulator/6410d31592fe8c435c022b01',
            data: {
                "email": String(user.email)
            }
        }).then((e: any) => {
            window.location.reload();
        });
    }

    return (
        <div>
            <h1>
                This is under the header so doesn't matter what I put here
            </h1>

            {userItem ? (
            <h1>
                Welcome to your Simulator Profile, {userItem.firstName} {userItem.lastName}
            </h1>
            ) : (
                <h1>error reading your name</h1>
            )}

            {simulators.length > 0 && (
                <div>
                <label htmlFor="sim-results">Simulator: </label>
                <select
                    id="sim-results"
                    value={selectedSimulator || ''}
                    onChange={handleSimulatorChange}
                >
                    <option value="" disabled hidden>
                    Select a simulator
                    </option>
                    {simulators.map((item) => (
                    <option>
                        {item}
                    </option>
                    ))}
                </select>
                </div>
            )}

            {selectedSimulator && !simulatorExists ? (
                <Button
                    size='small'
                    sx={{
                        backgroundColor: "secondary.main",
                        color: "white",
                        marginY: "1rem",
                        '&:hover': {
                        backgroundColor: 'secondary.dark',
                        }
                    }}
                    onClick={handleEnrollSubmit}
                    component={Link} to='/SimulatorPortfolio'>
                    Enroll Now
                </Button>
            ) : (
                <p></p>
            )}

            {selectedSimulator && simulatorExists ? (
            <p>
                Your account balance: {userItem.simulatorEnrollments[simIndex].balance}
            </p>
            ) : (
                <p></p>
            )}

            {selectedSimulator && simulatorExists ? (
                <div>
                <label htmlFor="stock-search-input">Search:</label>
                <input
                    id="stock-search-input"
                    type="text"
                    value={stockSearchTerm}
                    onChange={handleStockInputChange}
                />
                {filteredStockData.length > 0 && (
                    <div>
                    <label htmlFor="stock-search-results">Results:</label>
                    <select
                        id="stock-search-results"
                        value={selectedResult || ''}
                        onChange={handleStockInputSubmit}
                    >
                        <option value="" disabled hidden>
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
            
            {selectedSimulator && simulatorExists && chartItems ? (
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
                        <Chart chartData={chartData} />
                    </Paper>
                    <Typography variant='h4' align='center' fontWeight={50}>
                        Place an order:
                    </Typography>

                    <TextField required id="buy-input" label="Enter shares" variant="outlined" type="number" InputProps={{
                        inputProps: { 
                            max: 100, min: 1
                        }
                        
                    }} 
                        value={buyQuantity}
                        onChange={handleBuyInputChange}/>
                    <Button
                    size='small'
                    sx={{
                        backgroundColor: "secondary.main",
                        color: "white",
                        marginY: "1rem",
                        '&:hover': {
                        backgroundColor: 'secondary.dark',
                        }
                    }}
                    onClick={handleBuyInputSubmit}>
                    Buy {chartItems.meta.symbol}
                    </Button>

                    <TextField required id="sell-input" label="Enter shares" variant="outlined" type="number" InputProps={{
                        inputProps: { 
                            max: 100, min: 1
                        }
                        
                    }} 
                        value={sellQuantity}
                        onChange={handleSellInputChange}/>
                    <Button
                    size='small'
                    sx={{
                        backgroundColor: "secondary.main",
                        color: "white",
                        marginY: "1rem",
                        '&:hover': {
                        backgroundColor: 'secondary.dark',
                        }
                    }}
                    onClick={handleSellInputSubmit}>
                    Sell {chartItems.meta.symbol}
                    </Button>
                </Container>
            ) : (
                <p></p>
            )}

            

        </div>
    )
}

export default SimulatorPortfolioPage; 