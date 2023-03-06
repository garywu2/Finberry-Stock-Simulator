import { Box, Button, Container, Grid, TextField, Typography } from "@mui/material";
import { Link } from 'react-router-dom';
import axios from "axios";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import FirebaseContext from "../../context/firebase";
import UserContext from "../../context/user";

const RegisterPage = () => {
  const { auth } = useContext(FirebaseContext);
  const { user } = useContext(UserContext);

  const defaultValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    username: "",
    phoneNumber: "",
  };

  const [signupState, setSignupState] = useState(defaultValues);
  const [error, setError] = useState("");
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setSignupState({ ...signupState, [name]: value });
  };

  const navigate = useNavigate();

  const handleSumbit = (e: any) => {
    if (
      signupState.firstName &&
      signupState.lastName &&
      signupState.email &&
      signupState.phoneNumber &&
      signupState.password &&
      signupState.username
    ) {
      console.log(signupState);
      createUserWithEmailAndPassword(
        auth,
        signupState.email,
        signupState.password
      )
        .then((result: any) => {
          axios
            .post("http://localhost:5000/account/user", {
              firstName: signupState.firstName,
              lastName: signupState.lastName,
              email: signupState.email,
              phoneNum: signupState.phoneNumber,
              username: signupState.username,
              dateOfBirth: Date.now(),
              preferredName: 'test',
              permissionLevel: '0'
            })
            .then((servResult: any) => {
              console.log(servResult);
              setError("");
              setSignupState(defaultValues);
              navigate("/profile");
            })
            .catch((e: any) => {
              setError(e.response.data.msg);
            });
        })
        .catch((e: any) => {
          setError(e.message);
        });
    } else {
      setError("One of the required fields is missing!");
    }
  };

  return (
    <div>
      <Container
        sx={{
          backgroundColor: "primary.main",
          minHeight: "100vh",
          minWidth: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: '0 0 3rem 3rem',
          boxShadow: '0 4px 15px -6px black',
          marginBottom: '1rem',
          paddingTop: '5rem',
          paddingBottom: '2rem'
        }}>
        {!user ? (
          <Box
            component='form'
            display={"flex"}
            sx={{
              backgroundColor: 'white',
              borderRadius: "1rem",
              width: { xs: "100%", sm: "100%", md: "75%", lg: "50%" },
              paddingBottom: "3rem",
              margin: { sm: "0rem", lg: "3rem" },
            }}
            noValidate
            autoComplete='off'
          >
            <Grid container>
              <Grid xs={2}></Grid>
              <Grid xs={8} sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: 'center',
                justifyContent: "center",
                textAlign: "center"
              }}>
                <Typography variant="h3" align="center" fontWeight={400} padding={"2rem 0"}>
                  Register
                </Typography>
                <TextField
                  required
                  id='signup-first-name'
                  label='First Name'
                  name='firstName'
                  onChange={handleChange}
                  margin="normal"
                  sx={{
                    width: '100%'
                  }}
                  color="primary"
                  value={signupState.firstName}
                />
                <TextField
                  required
                  id='signup-last-name'
                  label='Last Name'
                  name='lastName'
                  onChange={handleChange}
                  margin="normal"
                  sx={{
                    width: '100%'
                  }}
                  color="primary"
                  value={signupState.lastName}
                />
                <TextField
                  required
                  id='signup-username'
                  label='Display Name'
                  name='username'
                  margin="normal"
                  sx={{
                    width: '100%'
                  }}
                  color="primary"
                  value={signupState.username}
                  onChange={handleChange}
                />
                <TextField
                  required
                  type='email'
                  id='signup-email'
                  label='Email'
                  name='email'
                  margin="normal"
                  sx={{
                    width: '100%'
                  }}
                  color="primary"
                  value={signupState.email}
                  onChange={handleChange}
                />
                <TextField
                  required
                  id='signup-password'
                  label='Password'
                  type='password'
                  name='password'
                  margin="normal"
                  sx={{
                    width: '100%'
                  }}
                  color="primary"
                  value={signupState.password}
                  onChange={handleChange}
                />
                <TextField
                  required
                  id='signup-phone-number'
                  label='Phone Number'
                  type='tel'
                  value={signupState.phoneNumber}
                  onChange={handleChange}
                  name='phoneNumber'
                  margin="normal"
                  sx={{
                    width: '100%'
                  }}
                  color="primary"
                />
                {error && <Typography color='red'>{error}</Typography>}
                <Button
                  size='medium'
                  fullWidth
                  sx={{
                    backgroundColor: "secondary.main",
                    color: "white",
                    marginY: "1rem",
                    '&:hover': {
                      backgroundColor: 'secondary.dark',
                    }
                  }}
                  onClick={handleSumbit}
                >
                  Register
                </Button>
                <Link style={{ fontFamily: 'Fredoka', margin: "10px" }} to="/login">Already have an account?</Link>
              </Grid>
              <Grid xs={2}></Grid>
            </Grid>
          </Box>
        ) : (
          <Navigate to='/profile'></Navigate>
        )}
      </Container>
    </div>
  );
};
export default RegisterPage;
