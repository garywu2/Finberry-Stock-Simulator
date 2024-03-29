import React from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Grid,
    Paper,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography
  } from '@mui/material';

const route = process.env.REACT_APP_FINBERRY_DEVELOPMENT === "true" ? 'http://localhost:5000/' : "https://finberry-stock-simulator-server.vercel.app/";

const ArticlePage = () => {
    const [article, setArticle] = React.useState<any>([]);
    const { id } = useParams();

    React.useEffect(() => {
      axios.get(route + 'Educational/article', {
      params: {
        _id: String(id),
        moreDetails: true
      },
      }).then((response) => {
        setArticle(response.data[0]);
      });
    }, [id]);


    return (
        <Container>
            <Typography variant="h3" align="center" fontWeight={400} paddingTop={"4.5rem"} paddingBottom={"0.5rem"}>
                {article.title}
            </Typography>
            <Typography
                variant='h5'
                align='center'
                fontWeight={400}
                paragraph
              >
            by: {article.author}
            </Typography>
            <Typography
                variant='h5'
                align='center'
                paragraph
              >
                {article.content}
            </Typography>
        </Container>
        
    )
}

export default ArticlePage;