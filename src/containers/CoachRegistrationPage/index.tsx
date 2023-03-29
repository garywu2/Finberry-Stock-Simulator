import { Box, Button, Container, Grid, TextField, Typography } from "@mui/material";
import { Link } from 'react-router-dom';
import axios from "axios";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import FirebaseContext from "../../context/firebase";
import UserContext from "../../context/user";

const route = process.env.REACT_APP_FINBERRY_DEVELOPMENT === "true" ? 'http://localhost:5000/' : "https://finberry-stock-simulator-server.vercel.app/";

const CoachRegistrationPage = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const defaultValues = {
        email: String(user.email),
        price: 0,
        description: "",
        image: "N/A",
        requestJustification: "",
    };

    const [registerState, setRegisterState] = useState(defaultValues);
    const [error, setError] = useState("");

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setRegisterState({ ...registerState, [name]: value });
    };

    const handleSumbit = (e: any) => {
        if (
            registerState.email &&
            registerState.price >= 0 &&
            registerState.description &&
            registerState.image &&
            registerState.requestJustification
          ) {
            console.log(registerState);

            axios({
                method: 'post',
                url:
                  route +
                  'account/coaching/',
                headers: {},
                data: {
                    email: registerState.email,
                    price: registerState.price,
                    description: registerState.description,
                    image: registerState.image,
                    requestJustification: registerState.requestJustification,
                },
            }).then((servResult: any) => {
                console.log(servResult);
                setError("");
                setRegisterState(defaultValues);
                navigate("/profile/" + user.email);
            }).catch((e: any) => {
                setError(e.response.data.msg);
            });
          } else {
            setError("One of the required fields is missing!");
          }
    }

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
            borderRadius: '0 0 3rem 3rem',
            boxShadow: '0 4px 15px -6px black',
            marginBottom: '1rem',
            paddingTop: '5rem',
            paddingBottom: '2rem',
          }}
        >
          {user ? (
            <Box
              component='form'
              display={'flex'}
              sx={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                width: { xs: '100%', sm: '100%', md: '75%', lg: '50%' },
                paddingBottom: '3rem',
                margin: { sm: '0rem', lg: '3rem' },
              }}
              noValidate
              autoComplete='off'
            >
              <Grid container>
                <Grid xs={2}></Grid>
                <Grid
                  xs={8}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    variant='h3'
                    align='center'
                    fontWeight={400}
                    padding={'2rem 0'}
                  >
                    Coaching Registration Request
                  </Typography>
                  <TextField
                    required
                    id='price'
                    label='Preferred price per session'
                    name='price'
                    onChange={handleChange}
                    margin='normal'
                    sx={{
                      width: '100%',
                    }}
                    color='primary'
                    value={registerState.price}
                  />
                  <TextField
                    required
                    id='description'
                    label='Services are you offering'
                    name='description'
                    onChange={handleChange}
                    margin='normal'
                    sx={{
                      width: '100%',
                    }}
                    color='primary'
                    value={registerState.description}
                    multiline
                    rows={3}
                  />
                  <TextField
                    required
                    id='requestJustification'
                    label='Background and experience'
                    name='requestJustification'
                    onChange={handleChange}
                    margin='normal'
                    sx={{
                      width: '100%',
                    }}
                    color='primary'
                    value={registerState.requestJustification}
                    multiline
                    rows={4}
                  />
                  {error && <Typography color='red'>{error}</Typography>}
                  <Button
                    size='medium'
                    fullWidth
                    sx={{
                      backgroundColor: 'secondary.main',
                      color: 'white',
                      marginY: '1rem',
                      '&:hover': {
                        backgroundColor: 'secondary.dark',
                      },
                    }}
                    onClick={handleSumbit}
                  >
                    Submit Request
                  </Button>
                </Grid>
                <Grid xs={2}></Grid>
              </Grid>
            </Box>
          ) : (
            <Navigate to={'/profile/' + user.email}></Navigate>
          )}
        </Container>
      </div>
    )
}

export default CoachRegistrationPage; 