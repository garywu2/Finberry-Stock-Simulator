import {
    Container,
    Grid,
    Paper,
  } from '@mui/material'
  import React, { useContext, useState } from 'react'
  import axios from 'axios'

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { TableContainer } from '@mui/material';
  
import Title from '../../components/Title'

const route =
process.env.REACT_APP_FINBERRY_DEVELOPMENT === 'true'
    ? 'http://localhost:5000/'
    : 'https://finberry-stock-simulator-server.vercel.app/'

const LeaderboardsPage = () => {
    const [leaderboardsData, setLeaderBoardsData] = React.useState<any>([])

    React.useEffect(() => {
        axios
        .get(route + 'game/balancecalculation/balance/learderboard')
        .then((response) => {
            setLeaderBoardsData(response.data)
        })
      }, [])
    
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
                
                    {leaderboardsData ? (
                        <Grid container spacing={3}>
                            {leaderboardsData.map((item: any) => (
                                <Grid item xs={12}>
                                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                                    {item ? (
                                    <TableContainer>
                                        <Title>{item.title} Challenge Leaderboard</Title>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Rank</TableCell>
                                                    <TableCell>Display Name</TableCell>
                                                    <TableCell>Total Value</TableCell>
                                                    <TableCell>Total Profit</TableCell>
                                                    <TableCell>Percent Change</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {item.orderedSimulatorEnrollments?.map((row: any) => (
                                                    <TableRow key={row._id}>
                                                        <TableCell>#{row.lastCalculatedRanking}</TableCell>
                                                        <TableCell>{row.user.username}</TableCell>
                                                        <TableCell>${(row.lastCalculatedTotal).toFixed(2)}</TableCell>
                                                        <TableCell>${(row.lastCalculatedTotal - item.userStartFund).toFixed(2)}</TableCell>
                                                        <TableCell>{((row.lastCalculatedTotal - item.userStartFund) / item.userStartFund * 100).toFixed(2)}%</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    ) : (
                                    <></>
                                    )}
                                </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <></>
                    )}
                </Container>
            </Container>
        </div>
    )
}

export default LeaderboardsPage; 