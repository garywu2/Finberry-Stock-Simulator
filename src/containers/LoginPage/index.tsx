import { Box, Button, Container, Link, MenuItem, TextField, Typography } from "@mui/material";
import axios from "axios";
import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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
    // Commenting out this line until post route for account is finished 
    console.log("hi");
  };

  return (
    <Container style={ { backgroundColor: "#7e57c2", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center"}}>
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
              }}
              onClick={handleSumbit}
            >
              Log In
            </Button>
            <Link href="/register" variant="body2">Create an account</Link>
        </Box>
      ) : (
        <Navigate to='/'></Navigate>
      )}
    </Container>
  );
};
export default LoginPage;