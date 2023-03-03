import { Box, Button, Container, Grid, TextField, Typography } from "@mui/material";
import { Link } from 'react-router-dom';
import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import FirebaseContext from "../../context/firebase";

const LoginPage = () => {
  const { auth } = useContext(FirebaseContext);
  const [userEmail, setUserEmail] = useState("");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState("");

  const handleChange = (e: any) => {
    setUserEmail(e.target.value);
  };
  const navigate = useNavigate();

  const resetPassword = (e: any) => {
    sendPasswordResetEmail(auth, userEmail).then((e: any) => {
      setEmailSent("Email Sucessfully Sent!");
    }).catch((e: any) => {
      setError(e.message);
    });
  };

  const returnToLoginPage = () => {
    navigate("/Login");
  }

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
          <Box
            component='form'
            display={"flex"}
            sx={{
              backgroundColor: 'white',
              borderRadius: "1rem",
              width: "100%",
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
                  Password Reset
                </Typography>
                <TextField
                  required
                  type='email'
                  id='email'
                  label='Email'
                  name='email'
                  margin="normal"
                  sx={{
                    width: '100%'
                  }}
                  color="primary"
                  defaultValue={userEmail}
                  onChange={handleChange}
                />
                {error && <Typography color='red'>{error}</Typography>}
                <div>
                <Button
                  size='medium'
                  
                  sx={{
                    backgroundColor: "secondary.main",
                    margin: "10px",
                    color: "white",
                    justifyContent: "space-between",
                    marginY: "1rem",
                    '&:hover': {
                      backgroundColor: 'secondary.dark',
                    }
                  }}
                  onClick={resetPassword}
                >
                  Reset Password
                </Button>
                <Button
                  size='medium'
                  
                  sx={{
                    backgroundColor: "secondary.main",
                    color: "white",
                    margin: "10px",
                    marginY: "1rem",
                    '&:hover': {
                      backgroundColor: 'secondary.dark',
                    }
                  }}
                  onClick={returnToLoginPage}
                >
                  Return to login page
                </Button>
                </div>
                {emailSent && <Typography color='green'>{emailSent}</Typography>}
              </Grid>
              <Grid xs={2}></Grid>
            </Grid>
          </Box>
      </Container>
    </div>
  );
};
export default LoginPage;