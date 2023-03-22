import * as React from 'react';
import { Link } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from '../Title';
import { TableContainer } from '@mui/material';

function preventDefault(event: React.MouseEvent) {
    event.preventDefault();
}

export default function Orders(data: any | undefined) {
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
                    {data?.data?.slice(0).reverse().map((row: any) => (
                        <TableRow key={row.id}>
                            <TableCell>{row.date.substring(0, row.date.indexOf('T'))}</TableCell>
                            <TableCell>{row.action}</TableCell>
                            <TableCell>{row.symbol}</TableCell>
                            <TableCell>{`$${row.price.toFixed(2)}`}</TableCell>
                            <TableCell>{row.quantity}</TableCell>
                            <TableCell align="right">{`$${(row.price * row.quantity).toLocaleString(undefined, {maximumFractionDigits:2})}`}</TableCell>
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