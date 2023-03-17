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

const tiers = [
  {
    title: 'Free',
    price: '0',
    description: ['Simulated Trading', 'Basic Games', 'Basic Badges', 'Ads'],
    buttonText: 'Sign up for free',
    buttonVariant: 'outlined',
    linkTo: '/register',
  },
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

const Pricing = () => {
    return (
        <React.Fragment>
            <Container disableGutters maxWidth="sm" component="main" sx={{ pt: 8, pb: 6 }}>
                <Typography
                    component="h1"
                    variant="h2"
                    align="center"
                    color="white"
                    gutterBottom
                >
                    Pricing
                </Typography>
                <Typography variant="h5" align="center" color="white" component="p">
                    Finberry is dedicated to providing you with hands-on, simulated investing
                    experience for <b>free</b>! Choose a plan that works best for you and start learning to invest.
                </Typography>
            </Container>
            {/* End hero unit */}
            <Container component="main">
                <Grid container spacing={5} alignItems="flex-end">
                    {tiers.map((tier) => (
                        <Grid
                            item
                            key={tier.title}
                            xs={12}
                            sm={tier.title === 'Enterprise' ? 12 : 6}
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
                                            mb: 2,
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
                                <CardActions>
                                    <Button
                                        fullWidth
                                        variant={tier.buttonVariant as 'outlined' | 'contained'}
                                        component={Link} to={tier.linkTo}
                                    >
                                        <b>{tier.buttonText}</b>
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </React.Fragment>
    );
}
export default Pricing;