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
import React, {useState} from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

import Chart from '../../components/Chart';

const SimulatorPortfolioPage = () => {
    const [items, setItems] = React.useState<any>();

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

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedResult, setSelectedResult] = useState(null);
  
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
        
        // const temp = currDate;
        currDate.setFullYear(currDate.getFullYear() - 1)
        const newDate = currDate;
        const stringNewDate = newDate.toISOString();
        const finalStr2 = stringNewDate.substring(0, stringNewDate.indexOf('T'));

        axios.get('https://api.twelvedata.com/time_series?&start_date=' + finalStr2 + '&symbol=' + String(selectedValue) + `&interval=1month&apikey=${process.env.REACT_APP_FINBERRY_TWELVEDATA_API_KEY}`).then((response) => {
            setItems(response.data)
        });
    //   React.useEffect(() => {

    //     }, []);
    };
  
    const filteredData = mockData.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h1>
                Simulator Portfolio Page placeholder
            </h1>
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
                </Container>
            ) : (
                <h1>error</h1>
            )}
        </div>
    )
}

export default SimulatorPortfolioPage; 