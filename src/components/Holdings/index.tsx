import * as React from 'react'
import { Link } from 'react-router-dom'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Title from '../Title'
import { TableContainer } from '@mui/material'
import Spinner from '../../components/Spinner'
import { areas } from '../../constants/areas'

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
            <TableCell>Exchange</TableCell>
            <TableCell>Average Price</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Total value</TableCell>
            <TableCell align='right'>All time return</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data && data.data && data.data.length === 0 && (
            <TableRow>
              <TableCell>
                <Spinner area={areas.simulatorPortfolioHoldings} />
              </TableCell>
              <TableCell>
                <Spinner area={areas.simulatorPortfolioHoldings} />
              </TableCell>
              <TableCell>
                <Spinner area={areas.simulatorPortfolioHoldings} />
              </TableCell>
              <TableCell>
                <Spinner area={areas.simulatorPortfolioHoldings} />
              </TableCell>
              <TableCell>
                <Spinner area={areas.simulatorPortfolioHoldings} />
              </TableCell>
              <TableCell>
                <Spinner area={areas.simulatorPortfolioHoldings} />
              </TableCell>
              <TableCell align='right'>
                <Spinner area={areas.simulatorPortfolioHoldings} />
              </TableCell>
            </TableRow>
          )}
          {data?.data
            ?.slice(0)
            .reverse()
            .map((row: any) => (
              <TableRow key={row.id}>
                <TableCell>{row.symbol}</TableCell>
                <TableCell>{row.exchange}</TableCell>
                {row.avgPrice < 0 ? (
                  <TableCell>N/A</TableCell>
                ) : (
                  <TableCell>{`$${row.avgPrice.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  })}`}</TableCell>
                )}
                {row.price < 0 ? (
                  <TableCell>N/A</TableCell>
                ) : (
                  <TableCell>{`$${row.price.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  })}`}</TableCell>
                )}
                <TableCell>{row.quantity}</TableCell>
                <TableCell>{`$${row.totalValue.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                })}`}</TableCell>
                {row.price < 0 ? (
                  <TableCell align='right'>-100.0%</TableCell>
                ) : (
                <TableCell align='right'>
                  {(
                    ((row.price - row.avgPrice) / row.avgPrice) *
                    100
                  ).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  })}
                  %
                </TableCell>
                )}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
