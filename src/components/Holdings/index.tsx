import * as React from 'react'
import { Link } from 'react-router-dom'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Title from '../Title'
import { TableContainer } from '@mui/material'

function preventDefault(event: React.MouseEvent) {
  event.preventDefault()
}

export default function Holdings(data: any | undefined) {
  return (
    <TableContainer>
      <Title>Holdings</Title>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell>Symbol</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Total value</TableCell>
            <TableCell align='right'>All time return</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.data
            ?.slice(0)
            .reverse()
            .map((row: any) => (
              <TableRow key={row.id}>
                <TableCell>{row.symbol}</TableCell>
                <TableCell>{row.name}</TableCell>
                {/* <TableCell>{`$${row.price.toFixed(2)}`}</TableCell> */}
                <TableCell>{row.quantity}</TableCell>
                {/* <TableCell>{`$${(row.price * row.quantity).toLocaleString(
                  undefined,
                  {
                    maximumFractionDigits: 2,
                  }
                )}`}</TableCell> */}
                <TableCell align='right'>All time return</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
