import { Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import { lightGreen } from "@mui/material/colors";
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
      {!user ? (
        <Box
          component='form'
          display={"flex"}
          flexDirection='column'
          sx={{
            "& .MuiTextField-root": { m: 1 },
            "& label.Mui-focused": {
              color: "darkblue",
            },

            "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                borderColor: "lightgreen",
              },
            },
            maxWidth: "600px",
            margin: "auto",
          }}
          noValidate
          autoComplete='off'
        >
          <Typography variant="h3" align="center" fontWeight={400}>
            User Registration
          </Typography>
          <div>
            <TextField
              required
              id='signup-first-name'
              label='FirstName'
              name='firstName'
              onChange={handleChange}
              fullWidth
              value={signupState.firstName}
            />
            <TextField
              required
              id='signup-last-name'
              label='LastName'
              name='lastName'
              onChange={handleChange}
              fullWidth
              value={signupState.lastName}
            />
            <TextField
              required
              type='email'
              id='signup-email'
              label='Email'
              name='email'
              fullWidth
              value={signupState.email}
              onChange={handleChange}
            />
            <TextField
              required
              id='signup-username'
              label='Username'
              name='username'
              fullWidth
              value={signupState.username}
              onChange={handleChange}
            />
            <TextField
              required
              id='signup-password'
              label='Password'
              type='password'
              name='password'
              fullWidth
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
              fullWidth
            />
          </div>
          {error && <Typography color='red'>{error}</Typography>}
          <Button
            size='large'
            sx={{
              backgroundColor: "darkblue",
              color: "lightgreen",
              marginY: "1rem",
            }}
            onClick={handleSumbit}
          >
            Create User
          </Button>
        </Box>
      ) : (
        <Navigate to='/'></Navigate>
      )}
    </div>
  );
};
export default RegisterPage;
