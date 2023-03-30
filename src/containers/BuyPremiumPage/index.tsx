import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import StarIcon from '@mui/icons-material/StarBorder';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Pricing from '../../components/Pricing'
import UserContext from "../../context/user";
import { useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";

  
  const BuyPremiumPage = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const tiers = [
        {
          title: 'Plus',
          subheader: 'Most popular',
          price: '4.99',
          description: [
            'Simulated Trading',
            'Exclusive Games',
            'Exclusive Badges',
            'Ad-free',
            '5% Coaching Discount',
          ],
          buttonText: 'Get started',
          buttonVariant: 'contained',
          linkTo: '/register',
        },
        {
          title: 'Enterprise',
          price: '50',
          description: [
            'Simulated Trading',
            'Exclusive Games & Badges',
            'Ad-free',
            'Multiple accounts',
            'Team management',
            'Phone & email support',
          ],
          buttonText: 'Contact us',
          buttonVariant: 'outlined',
          linkTo: '/contact',
        },
      ]
          return (
            <Container
            sx={{
              borderRadius: '3rem',
              boxShadow: '0 4px 15px -1px black',
              backgroundColor: 'primary.main',
              minHeight: '100vh',
              minWidth: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '1rem',
              marginBottom: '1rem',
              padding: '2rem',
            }}
          >
            {user ? (
              <React.Fragment>
                  <Container disableGutters maxWidth="sm" component="main" sx={{ pt: 8, pb: 6 }}>
                      <Typography
                          component="h1"
                          variant="h2"
                          align="center"
                          color="white"
                          gutterBottom
                      >
                          Upgrading to Premium
                      </Typography>
                      <Typography variant="h5" align="center" color="white" component="p">
                      Upgrading your account will give you access to a variety of perks as soon below. It would also help us with infrastructure and allow us to provide more high quality content for you!
                      </Typography>
                  </Container>
                  {/* End hero unit */}
                  <Container>
                      <Grid container spacing={4} alignItems="center" justifyContent="center">
                          {tiers.map((tier) => (
                              <Grid
                                  item
                                  key={tier.title}
                                  xs={12}
                                  sm={12}
                                  md={4}
                              >
                                  <Card sx={{ borderRadius: '0.5rem' }}>
                                      <CardHeader
                                          title={tier.title}
                                          subheader={tier.subheader}
                                          titleTypographyProps={{ align: 'center', color: 'primary', fontWeight: 'bold' }}
                                          action={tier.title === 'Plus' ? <StarIcon /> : null}
                                          subheaderTypographyProps={{
                                              align: 'center',
                                          }}
                                          sx={{
                                              backgroundColor: (theme) =>
                                                  theme.palette.mode === 'light'
                                                      ? theme.palette.grey[200]
                                                      : theme.palette.grey[700],
                                          }}
                                      />
                                      <CardContent >
                                          <Box
                                              sx={{
                                                  display: 'flex',
                                                  justifyContent: 'center',
                                                  alignItems: 'baseline',
                                              }}
                                          >
                                              <Typography component="h2" variant="h3" color="text.primary">
                                                  ${tier.price}
                                              </Typography>
                                              <Typography variant="h6" color="text.secondary">
                                                  /mo
                                              </Typography>
                                          </Box>
                                          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                              {tier.description.map((line) => (
                                                  <Typography
                                                      component="li"
                                                      variant="subtitle1"
                                                      align="center"
                                                      key={line}
                                                  >
                                                      {line}
                                                  </Typography>
                                              ))}
                                          </ul>
                                      </CardContent>
                                      {tier.buttonText === "Get started" ? (
                                        <CardActions>
                                          <a style={{ fontFamily: 'Fredoka', justifyContent: 'center', display: 'center', alignItems: 'center', width: '100%', textAlign: 'center', fontSize: '25px' }} href="https://buy.stripe.com/test_4gw7tpcX31xfcj6288" target="_blank" rel="noreferrer">{tier.buttonText}</a>
                                        </CardActions>
                                      ) : (
                                        <CardActions>
                                          <Link style={{ fontFamily: 'Fredoka', justifyContent: 'center', display: 'center', alignItems: 'center', width: '100%', textAlign: 'center', fontSize: '25px' }} to={tier.linkTo}>{tier.buttonText}</Link>
                                        </CardActions>
                                      )}
                                  </Card>
                              </Grid>
                          ))}
                      </Grid>
                  </Container>
              </React.Fragment>
              ) : (
                <Navigate to='/login'></Navigate>
              )}
              </Container>
          );
      }
  
  export default BuyPremiumPage;