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

import Chart from '../../components/Chart';

const SimulatorPortfolioPage = () => {
    const { user } = useContext(UserContext);
    const [items, setItems] = React.useState<any>();
    const [userItems, setUserItems] = React.useState<any>([]);
    const [realTimePrice, setRealTimePrice] = React.useState<any>();
    // const [balItem, setBalItem] = React.useState<any>([]);

    var data = []

    if (items) {
        for (var i = items.values.length - 1; i >= 0; i--) {
            var temp = { date: String(items.values[i].datetime), price: Number(items.values[i].close) };
            data.push(temp)
        }
    }

    const mockData = [
        { name: "AAPL", company: "Apple" },
        { name: "TSLA", company: "Telsa" },
        { name: "MSFT", company: "Microsoft" },
        { name: "GOOG", company: "Google" },
    ];

    const simulators = ['All Time', 'Monthly', 'Weekly']

    const [searchTerm, setSearchTerm] = useState('');
    const [buyAmount, setBuyAmount] = useState(-1);
    const [selectedResult, setSelectedResult] = useState(null);
    const [selectedSimulator, setSelectedSimulator] = useState(null);
    
    var simulatorExists = false;
    var simIndex = 0;
    if (selectedSimulator && userItems.simulatorEnrollments && userItems.simulatorEnrollments.length > 0) {
        for(var i = 0; i < userItems.simulatorEnrollments.length; i += 1) {
            // statement below gets uncommented when Daniel changes route 
            // if (selectedSimulator == userItems.simulatorEnrollments[i].title){
            if (selectedSimulator == 'All Time'){
                simulatorExists = true;
                simIndex = i;
            }
        }
    }

    const handleSimulatorChange = (event: any) => {
        setSelectedSimulator(event.target.value);
    };

    const handleBuyInputChange = (event: any) => {
        setBuyAmount(event.target.value);
    }
  
    const handleInputChange = (event: any) => {
        setSearchTerm(event.target.value);
        setSelectedResult(null);
    };
  
    const handleSelectChange = (event: any) => {
        const selectedValue = event.target.value;
        setSelectedResult(selectedValue);
        setSearchTerm(selectedValue);
        
        const currDate = new Date(Date.now());
        const stringDate = currDate.toISOString();
        const finalStr = stringDate.substring(0, stringDate.indexOf('T'));
        
        currDate.setFullYear(currDate.getFullYear() - 1)
        const newDate = currDate;
        const stringNewDate = newDate.toISOString();
        
        const finalStr2 = stringNewDate.substring(0, stringNewDate.indexOf('T'));

        axios.get('https://api.twelvedata.com/time_series?&start_date=' + finalStr2 + '&symbol=' + String(selectedValue) + '&interval=1month&apikey=bda95123e0344a5ba4e148064a3eabea').then((response) => {
            setItems(response.data)
        });
    };

    const handleSubmit = (event: any) => {
        axios.get('https://api.twelvedata.com/price?symbol=' + items.meta.symbol + '&apikey=bda95123e0344a5ba4e148064a3eabea').then((response) => {
            setRealTimePrice(response.data)
        });

        if(realTimePrice) {
            axios({
                method: 'post',
                url:  'http://localhost:5000/game/simulator/' + userItems.simulatorEnrollments[simIndex].simulator + '/' + String(user.email) ,
                headers: {},
                data: {
                    "symbol": items.meta.symbol,
                    "index": items.meta.exchange,
                    "transactionType": 1,
                    "quantity": buyAmount,
                    "price": realTimePrice.price,
                    "transactionTime": Date.now()
                }
            }).then((result: any) => {
                axios.get('http://localhost:5000/account/user/' + String(user.email)).then((response) => {
                setUserItems(response.data);
                });
            });
        }
        
        
    }

    React.useEffect(() => {
        axios.get('http://localhost:5000/account/user/' + String(user.email)).then((response) => {
            setUserItems(response.data);
        });
    }, []);

    // React.useEffect(() => {
    //     if(userItems.simulatorEnrollments) {
    //         axios.get('http://localhost:5000/game/balance/' + String(userItems.simulatorEnrollments[0]) + "/" + String(user.email)).then((response) => {
    //             setBalItem(response.data);
    //             console.log(balItem);
    //         });
    //     }
    // }, []);
  
    const filteredData = mockData.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h1>
                This is under the header so doesn't matter what I put here
            </h1>

            {userItems ? (
            <h1>
                Welcome to your Simulator Profile, {userItems.firstName} {userItems.lastName}
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

            

            {selectedSimulator && simulatorExists ? (
            <p>
                Your account balance: {userItems.simulatorEnrollments[simIndex].balance}
            </p>

            
            ) : (
                <p></p>
            )}

            {selectedSimulator && simulatorExists ? (
                <div>
                <label htmlFor="search-input">Search:</label>
                <input
                    id="search-input"
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                />
                {filteredData.length > 0 && (
                    <div>
                    <label htmlFor="search-results">Results:</label>
                    <select
                        id="search-results"
                        value={selectedResult || ''}
                        onChange={handleSelectChange}
                    >
                        <option value="" disabled hidden>
                        Select an option
                        </option>
                        {filteredData.map((item) => (
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
            

            
            {selectedSimulator && simulatorExists && items ? (
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
                        <Chart data={data} />
                    </Paper>
                    {/* <Typography variant='h3' fontWeight={400}>
                        If you bought $1000 of ${items.meta.symbol} on {data[100].date}, it would be worth ${((1000 / data[100].price * data[items.values.length - 1].price).toFixed(2)).toLocaleString()} on {data[items.values.length - 1].date}
                    </Typography> */}
                    <Typography variant='h4' align='center' fontWeight={50}>
                        Place an order:
                    </Typography>

            
                    {/* <label htmlFor="buy-input">How many shares would you like to buy? </label>
                    <input
                        id="buy-input"
                        type="number"
                        value={buyTerm}
                        onChange={handleBuyInputChange}
                        min="1"
                        max="1000"
                    /> */}
                    <TextField required id="buy-input" label="Enter shares" variant="outlined" type="number" InputProps={{
                        inputProps: { 
                            max: 100, min: 1
                        }
                        
                    }} 
                        value={buyAmount}
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
                    onClick={handleSubmit}>
                    Buy {items.meta.symbol}
                    </Button>
                </Container>
            ) : (
                <p></p>
            )}

            

        </div>
    )
}

export default SimulatorPortfolioPage; 