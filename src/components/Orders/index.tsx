import * as React from 'react';
import { Link } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from '../Title';
import { TableContainer } from '@mui/material';

function createData(
    id: number,
    date: string,
    action: string,
    symbol: string,
    price: number,
    quantity: number,
) {
    return { id, date, action, symbol, price, quantity };
}

const rows = [
    createData(
        0,
        'Jan 27, 2023',
        'Buy',
        'TSLA',
        124.14,
        12,
    ),
    createData(
        1,
        'Feb 14, 2023',
        'Buy',
        'AMZN',
        324.21,
        5,
    ),
    createData(
        2,
        'Feb 16, 2023',
        'Buy',
        'AAPL',
        142.66,
        8),
    createData(
        3,
        'Feb 24, 2023',
        'Sell',
        'META',
        172.04,
        16,
    ),
];

function preventDefault(event: React.MouseEvent) {
    event.preventDefault();
}

export default function Orders() {
    return (
        <TableContainer>
            <Title>Recent Orders</Title>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell>Symbol</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell align="right">Trade Amount</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>{row.action}</TableCell>
                            <TableCell>{row.symbol}</TableCell>
                            <TableCell>{`$${row.price}`}</TableCell>
                            <TableCell>{row.quantity}</TableCell>
                            <TableCell align="right">{`$${row.price * row.quantity}`}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Link color="primary" to={'/'} style={{ margin: '2rem 0' }} onClick={preventDefault} >
                See more orders
            </Link>
        </TableContainer>
        
    );
}