import React, { useState, useEffect, useContext } from 'react';
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
import axios from 'axios';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import UserContext from '../../context/user';
import Title from '../../components/Title'
import { trackPromise } from 'react-promise-tracker'
import Spinner from '../../components/Spinner'
import { areas } from '../../constants/areas'

const ArticlesPage = () => {
  const route =
    process.env.REACT_APP_FINBERRY_DEVELOPMENT === 'true'
      ? 'http://localhost:5000/'
      : 'https://finberry-stock-simulator-server.vercel.app/'
  const navigate = useNavigate()
  const [articles, setArticles] = useState<any>([])

  React.useEffect(() => {
    trackPromise(
      axios.get(route + 'Educational/article').then((response) => {
        setArticles(response.data)
      }),
      areas.articlesPage
    )
  }, [])

  const getArticleId = async (id: React.Key | null | undefined) => {
    await axios
      .get(route + 'Educational/article?_id=' + id)
      .then((response) => {
        return response.data._id
      })
  }

  return (
    <Container
      sx={{
        minHeight: '100vh',
        minWidth: '100%',
        borderRadius: '3rem',
        marginBottom: '1rem',
        paddingTop: '5rem',
      }}
    >
      <Title>Articles</Title>
      <Container
        sx={{
          backgroundColor: 'white',
          minHeight: '100vh',
          minWidth: '100%',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'flex-start',
          borderRadius: '3rem',
          boxShadow: '0 4px 15px -6px black',
          marginBottom: '1rem',
          paddingBottom: '2rem',
          overflow: 'auto',
          paddingTop: '1rem',
        }}
      >
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align='left'>Source</TableCell>
              <TableCell align='left'>Author</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow key={'spinner'}>
                <TableCell>
                  <Spinner area={areas.articlesPage} />
                </TableCell>
                <TableCell>
                  <Spinner area={areas.articlesPage} />
                </TableCell>
                <TableCell align='left'>
                  <Spinner area={areas.articlesPage} />
                </TableCell>
                <TableCell>
                  <Spinner area={areas.articlesPage} />{' '}
                </TableCell>
              </TableRow>
            ) : (
              articles.map(
                (article: {
                  title: React.Key | null | undefined
                  _id: String | React.ReactChild | React.ReactFragment
                  description:
                    | String
                    | React.ReactChild
                    | React.ReactFragment
                    | React.ReactPortal
                    | null
                    | undefined
                  author:
                    | String
                    | React.ReactChild
                    | React.ReactFragment
                    | React.ReactPortal
                    | null
                    | undefined
                  externalLink: String
                }) => (
                  <TableRow key={article.title}>
                    <TableCell>
                      {article.externalLink === 'N/A' ? (
                        <Link
                          style={{ fontFamily: 'Fredoka', margin: '10px' }}
                          to={'/article/' + article._id}
                          target='_blank'
                          rel='noreferrer'
                        >
                          {article.title}
                        </Link>
                      ) : (
                        <a
                          style={{ fontFamily: 'Fredoka', margin: '10px' }}
                          href={String(article.externalLink)}
                          target='_blank'
                          rel='noreferrer'
                        >
                          {article.title}
                        </a>
                      )}
                    </TableCell>
                    <TableCell>{article.description}</TableCell>
                    <TableCell>
                      {article.externalLink === 'N/A'
                        ? 'Finberry'
                        : 'Trusted Source'}
                    </TableCell>
                    <TableCell align='left'>{article.author}</TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </Container>
    </Container>
  )
}

export default ArticlesPage 
