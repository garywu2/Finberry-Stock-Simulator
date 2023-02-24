import { Box, Button, Container, MenuItem, TextField, Typography } from "@mui/material";
import { Link } from 'react-router-dom';
import axios from "axios";
import { useContext, useState } from "react";

const ContactPage = () => {

    return (
        <div>
            <Container
                sx={{ backgroundColor: "#7e57c2", minHeight: "100vh", minWidth: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                        Contact Us
                    </Typography>
                    <div>
                        <TextField
                            required
                            id='contact-name'
                            label='Full Name'
                            name='name'
                            margin="normal"
                            sx={{
                                width: '100%'
                            }}
                            color="primary"
                        />
                        <TextField
                            required
                            id='contact-email'
                            label='Email'
                            name='email'
                            margin="normal"
                            sx={{
                                width: '100%'
                            }}
                            color="primary"
                        />
                        <TextField
                            required
                            id="contact-message"
                            label="Enter your message here"
                            name='email'
                            margin="normal"
                            sx={{
                                width: '100%'
                            }}
                            color="primary"
                            multiline
                            rows={4}
                        />
                    </div>
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
                    // onClick={handleSumbit}
                    >
                        Submit
                    </Button>
                </Box>
            </Container>
        </div>
    );
};
export default ContactPage;