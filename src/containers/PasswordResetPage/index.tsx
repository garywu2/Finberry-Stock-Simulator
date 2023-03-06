import { Box, Button, Container, Grid, TextField, Typography } from "@mui/material";
import { Link } from 'react-router-dom';
import { useContext, useState } from "react";
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

  const resetPassword = (e: any) => {
    sendPasswordResetEmail(auth, userEmail).then((e: any) => {
      setEmailSent("Email Sucessfully Sent!");
    }).catch((e: any) => {
      setError(e.message);
    });
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
            onSubmit={resetPassword}
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
                  Reset password
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
                  type="submit"
                >
                  Reset Password
                </Button>
                <Link style={{ fontFamily: 'Fredoka', margin: "10px" }} to="/login">Return to login page</Link>
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