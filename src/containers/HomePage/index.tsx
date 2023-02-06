import { Box, Button, Container, MenuItem, TextField, Typography } from "@mui/material";
import { Link } from 'react-router-dom';
import axios from "axios";
import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const HomePage = () => {
    return (
        <div>
            <Container
                sx={{ backgroundColor: "primary.main", minHeight: "100vh", minWidth: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0 0 3rem", boxShadow: "3px 3px 15px black", marginBottom: "1rem" }}>
                <Typography variant="h3" align="center" fontWeight={400}>
                    Some content
                </Typography>
            </Container>
            <Container
                sx={{ backgroundColor: "white", minHeight: "100vh", minWidth: "100%", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "1rem", marginBottom: "1rem" }}>
                <Typography variant="h3" align="center" fontWeight={400}>
                    Some more content
                </Typography>
            </Container>
            <Container
                sx={{ backgroundColor: "white", minHeight: "100vh", minWidth: "100%", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "1rem", marginBottom: "1rem" }}>
                <Typography variant="h3" align="center" fontWeight={400}>
                    And even more content
                </Typography>
            </Container>
        </div>
    )
}

export default HomePage;