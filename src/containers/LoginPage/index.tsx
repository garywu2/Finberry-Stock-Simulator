import { Box, Button, Container, MenuItem, TextField, Typography } from "@mui/material";
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
    username: "",
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
      loginState.username &&
      loginState.password
    ) {
      console.log(loginState);
      signInWithEmailAndPassword(
        auth,
        loginState.username,
        loginState.password
      )
      .then((servResult: any) => {
        console.log(servResult);
        setError("");
        setLoginState(defaultValues);
        navigate("/profile");
      })
      .catch((e: any) => {
        setError(e.response.data.msg);
      });
    } else {
      setError("One of the required fields is missing!");
    }
  };

  return (
    <div>
      <Container
        sx={{ backgroundColor: "#7e57c2", minHeight: "100vh", minWidth: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {!user ? (
          <Box
            component='form'
            display={"flex"}
            flexDirection='column'
            alignItems={'center'}
            justifyContent="center"
            textAlign={'center'}
            minWidth="50%"
            maxWidth="70%"
            margin="0 auto"
            padding="2rem"
            sx={{
              backgroundColor: 'white',
              borderRadius: "1rem"
            }}
            noValidate
            autoComplete='off'
          >
            <Typography variant="h3" align="center" fontWeight={400}>
              LOG IN
            </Typography>
            <div>
              <TextField
                required
                id='login-username'
                label='Username'
                name='username'
                margin="normal"
                sx={{
                  width: '100%'
                }}
                color="primary"
                value={loginState.username}
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
            </div>
            {error && <Typography color='red'>{error}</Typography>}
            <Button
              size='medium'
              sx={{
                backgroundColor: "secondary.main",
                color: "white",
                marginY: "1rem",
                width: "20%",
                '&:hover': {
                  backgroundColor: 'secondary.dark',
                }
              }}
              onClick={handleSumbit}
            >
              Log In
            </Button>
            <Link to="/register">Create an account</Link>
          </Box>
        ) : (
          <Navigate to='/'></Navigate>
        )}
      </Container>
    </div>
  );
};
export default LoginPage;