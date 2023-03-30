import React, { useState, useEffect, useContext } from 'react';
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
    Typography
  } from '@mui/material';
import axios from 'axios';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import UserContext from '../../context/user';
import Title from '../../components/Title'
import { trackPromise } from 'react-promise-tracker'
import Spinner from '../../components/Spinner'
import { areas } from '../../constants/areas'

const CoachCataloguePage = () => {
  const [coaches, setCoaches] = useState<any>([]);
  const route = process.env.REACT_APP_FINBERRY_DEVELOPMENT === "true" ? 'http://localhost:5000/' : "https://finberry-stock-simulator-server.vercel.app/";

  useEffect(() => {
    trackPromise(
      axios.get(
        route +
        'account/coaching',
        {
          params: {
            populateUserEmailAndUsername: true,
            status: 1
          }
        }
      ).then((response) => {
        setCoaches(response.data);
      }),
      areas.coachCatalogue
    );
  }, []);

  return (
    <Container
      sx={{
        minHeight: '100vh',
        minWidth: '100%',
        borderRadius: '3rem',
        marginBottom: '1rem',
        paddingTop: '5rem',
      }}
    >
      <Title>Coach Catalogue</Title>
      <Container
        sx={{
          backgroundColor: 'white',
          minHeight: '100vh',
          minWidth: '100%',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'flex-start',
          borderRadius: '3rem',
          boxShadow: '0 4px 15px -6px black',
          marginBottom: '1rem',
          paddingBottom: '2rem',
          overflow: 'auto',
          paddingTop: '1rem',
        }}
      >
      <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Display Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell align="left">Email</TableCell>
              </TableRow>
            </TableHead>
        <TableBody>
              {coaches.length === 0 ? (
                <TableRow key={'spinner'}>
                  <TableCell>
                    <Spinner area={areas.coachCatalogue} />
                  </TableCell>
                  <TableCell>
                    <Spinner area={areas.coachCatalogue} />
                  </TableCell>
                  <TableCell align='left'>
                    <Spinner area={areas.coachCatalogue} />
                  </TableCell>
                </TableRow>
              ) : (
              coaches.map((coach: any) => (
                <TableRow key={coach._id}>
                  <TableCell>
                    <Link style={{ fontFamily: 'Fredoka', margin: "10px" }} to={'/CoachPortal/' + coach.user?.email}>{coach.user?.username}</Link>
                    </TableCell>
                  <TableCell>${coach.price}/hr</TableCell>
                  <TableCell align='left'>{coach.user?.email}</TableCell>
                  <TableCell>
                    <Button> 
                    </Button>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
      </Table>
      </Container>
    </Container>
  )
}

export default CoachCataloguePage; 