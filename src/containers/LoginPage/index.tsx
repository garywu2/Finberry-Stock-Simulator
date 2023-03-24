import { Box, Button, Container, Grid, TextField, Typography } from "@mui/material";
import { Link } from 'react-router-dom';
import axios from "axios";
import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import FirebaseContext from "../../context/firebase";
import UserContext from "../../context/user";

const LoginPage = () => {
  const { auth } = useContext(FirebaseContext);
  const { user } = useContext(UserContext);

  const defaultValues = {
    email: "",
    password: ""
  };

  const [loginState, setLoginState] = useState(defaultValues);
  const [error, setError] = useState("");
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setLoginState({ ...loginState, [name]: value });
  };

  const navigate = useNavigate();

  const handleSumbit = (e: any) => {
    if (
      loginState.email &&
      loginState.password
    ) {
      signInWithEmailAndPassword(
        auth,
        loginState.email,
        loginState.password
      )
        .then((servResult: any) => {
          console.log(servResult);
          setError("");
          setLoginState(defaultValues);
          navigate("/profile/" + loginState.email);
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
                  Log In
                </Typography>
                <TextField
                  required
                  id='login-email'
                  label='Email'
                  name='email'
                  margin="normal"
                  sx={{
                    width: '100%'
                  }}
                  color="primary"
                  value={loginState.email}
                  onChange={handleChange}
                />
                <TextField
                  required
                  id='login-password'
                  label='Password'
                  type='password'
                  name='password'
                  margin="normal"
                  sx={{
                    width: '100%'
                  }}
                  color="primary"
                  value={loginState.password}
                  onChange={handleChange}
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
                  Log In
                </Button>
                <Link style={{ fontFamily: 'Fredoka', margin: "10px" }} to="/register">Create an account</Link>
                <Link style={{ fontFamily: 'Fredoka', margin: "10px" }} to="/PasswordReset">Reset Password</Link>
              </Grid>
              <Grid xs={2}></Grid>
            </Grid>
          </Box>
        ) : (
          <Navigate to={'/profile/' + user.Email}></Navigate>
        )}
      </Container>
    </div>
  );
};
export default LoginPage;