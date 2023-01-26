import { Box, Button, MenuItem, TextField, Typography } from "@mui/material";
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
    <div>
      {!user ? (
        <Box
          component='form'
          display={"flex"}
          flexDirection='column'
          sx={{
            "& .MuiTextField-root": { m: 1 },
            "& label.Mui-focused": {
              color: "primary.main",
            },

            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: "lightgreen",
              },
            },
            maxWidth: "60%",
            margin: "auto",
            backgroundColor: 'primary.main',
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
              fullWidth
              value={loginState.username}
              onChange={handleChange}
            />
            <TextField
              required
              id='login-password'
              label='Password'
              type='password'
              name='password'
              fullWidth
              value={loginState.password}
              onChange={handleChange}
            />
          </div>
          {error && <Typography color='red'>{error}</Typography>}
          <Button
            size='large'
            sx={{
              backgroundColor: "secondary.main",
              color: "white",
              marginY: "1rem",
            }}
            onClick={handleSumbit}
          >
            Log In
          </Button>
        </Box>
      ) : (
        <Navigate to='/'></Navigate>
      )}
    </div>
  );
};
export default LoginPage;