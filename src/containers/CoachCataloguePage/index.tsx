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
import Title from '../../components/Title';

const CoachCataloguePage = () => {
  const [coaches, setCoaches] = useState<any>([]);
  const [realCoaches, setRealCoaches] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const route = process.env.REACT_APP_FINBERRY_DEVELOPMENT === "true" ? 'http://localhost:5000/' : "https://finberry-stock-simulator-server.vercel.app/";
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(route + 'account/user/').then((response) => {
        setCoaches(response.data)
      })

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
      setRealCoaches(response.data);
    });
  }, []);

//   const filteredCoaches = coaches.filter((coach: { firstname: string; }) => {
//     return coach.firstname.toLowerCase().includes(searchQuery.toLowerCase());
//   });

    const getUser = (email: any) => {
        axios.get(route + 'account/user', {
          params: {
            email: email,
            enforceSingleOutput: true
          }
        }).then((response: any) => {
            navigate("/profile/" + response.email);
            return;
        })
    };

  return (
    <Container
    sx={{
        minHeight: '100vh',
        minWidth: '100%',
        borderRadius: '3rem',
        marginBottom: '1rem',
        paddingTop: '5rem',
      }}>
    <Title>Coach Catalogue (Showing List of Users Right now)</Title>
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
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell align="left">Email</TableCell>
              </TableRow>
            </TableHead>
      <TableBody>
              {coaches.map((coach: { firstName: React.Key | null | undefined; lastName: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; bio: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined; email: String | null | undefined }) => (
                <TableRow key={coach.firstName}>
                  <TableCell>
                    <Link style={{ fontFamily: 'Fredoka', margin: "10px" }} to={'/profile/' + coach.email}>{coach.firstName}</Link>
                    </TableCell>
                  <TableCell>{coach.lastName}</TableCell>
                  <TableCell align='left'>{coach.email}</TableCell>
                  <TableCell>
                    <Button> 
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
    </Container>

    <Title>Coach Catalogue (List of Coaches)</Title>
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
              {realCoaches.map((coach: any) => (
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
              ))}
            </TableBody>
      </Table>
    </Container>
    </Container>
  );
};

export default CoachCataloguePage; 