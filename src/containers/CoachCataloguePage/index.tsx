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
import UserContext from '../../context/user'

const CoachCataloguePage = () => {
  const [coaches, setCoaches] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortParam, setSortParam] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const route = process.env.REACT_APP_FINBERRY_DEVELOPMENT === "true" ? 'http://localhost:5000/' : "https://finberry-stock-simulator-server.vercel.app/";
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(route + 'account/user/').then((response) => {
        setCoaches(response.data)
      })
  }, []);

//   const filteredCoaches = coaches.filter((coach: { firstname: string; }) => {
//     return coach.firstname.toLowerCase().includes(searchQuery.toLowerCase());
//   });

    const getUser = (email: any) => {
        axios.get(route + 'account/user/' + String(email)).then((response: any) => {
            navigate("/profile/" + response.email);
            return;
        })
    };

  return (
    <Container
        sx={{
          backgroundColor: 'white',
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
                    <Link style={{ fontFamily: 'Fredoka', margin: "10px" }} to={'/profile/' + coach.email}>{coach.lastName}</Link>
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
  );
};

export default CoachCataloguePage; 