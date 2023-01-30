import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { Link } from 'react-router-dom';
import axios from "axios";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import FirebaseContext from "../../context/firebase";
import UserContext from "../../context/user";
import Header from '../../components/Header';

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

  const links = [
    { label: 'Login', path: '/login' },
  ];

  const [signupState, setSignupState] = useState(defaultValues);
  const [error, setError] = useState("");
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setSignupState({ ...signupState, [name]: value });
  };

  const navigate = useNavigate();

  const handleSumbit = (e: any) => {
    // if (
    //   signupState.firstName &&
    //   signupState.lastName &&
    //   signupState.email &&
    //   signupState.phoneNumber &&
    //   signupState.password &&
    //   signupState.username
    // ) {
    //   console.log(signupState);
    //   createUserWithEmailAndPassword(
    //     auth,
    //     signupState.email,
    //     signupState.password
    //   )
    //     .then((result: any) => {
    //       axios
    //         .post("http://localhost:5000/accounts", {
    //           firstName: signupState.firstName,
    //           lastName: signupState.lastName,
    //           email: signupState.email,
    //           phoneNum: signupState.phoneNumber,
    //           username: signupState.username,
    //         })
    //         .then((servResult: any) => {
    //           console.log(servResult);
    //           setError("");
    //           setSignupState(defaultValues);
    //           navigate("/");
    //         })
    //         .catch((e: any) => {
    //           setError(e.response.data.msg);
    //         });
    //     })
    //     .catch((e: any) => {
    //       setError(e.message);
    //     });
    // } else {
    //   setError("One of the required fields is missing!");
    // }
    // Commenting out this line until post route for account is finished 
    console.log("hi");
  };

  return (
    <div>
      <Header title="Finberry" links={links} />
      <Container style={ { backgroundColor: "#7e57c2", minHeight: "100vh", minWidth: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>
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
            REGISTER
          </Typography>
          <div>
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
              id='signup-username'
              label='Username'
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
            Register
          </Button>
          <Link to="/login">Already have an account?</Link>
        </Box>
      ) : (
        <Navigate to='/'></Navigate>
      )}
      </Container>
    </div>
    
  );
};
export default RegisterPage;
