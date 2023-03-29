import {
    Box,
    Button,
    Container,
    Grid,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { Link } from 'react-router-dom'
import { width } from '@mui/system';


interface Faq {
    title: string;
    description: string;
}

const faqs: Faq[] = [
    { title: 'What is Finberry?', description: 'A platform that provides a range of resources to help users gain investing experience and become financially empowered. These resources include simulated trading, personal portfolio management tools, coaching, literary resources, and games and contests.' },
    { title: 'What is our mission?', description: 'By combining both literary and gamified resources, we aim to make learning about investing fun and engaging for our users.' },
    { title: 'What is the cost?', description: 'A basic membership is completely free and will allow for simulated trading, basic games, and basic badges. Our plus membership is $4.99 per month and has simulated trading, exclusive games, exclusive badges, an ad-free experience, and a 5% Coaching Discount. Our enterprise membership is $50 per month and has simulated trading, exclusive games & badges, an ad-free experience, multiple accounts (up to 20), team management, phone & email support, and is ideal for schools and teams.' },
    { title: 'How do I sign up?', description: 'Click the “Register” button on the top right to get started today!' },
    { title: 'Who are the Financial Coaches?', description: 'Financial coaches are experienced investors with knowledge to share. Each coach is vetted by our team at Finberry and has reviews available from other users so that you can decide if they are the right fit for you.' },
    { title: 'How much is a Financial Coaching session?', description: 'Prices for a financial coaching session are set individually by each coach.' },
    { title: 'What currency is used throughout the website?', description: 'Currency is in USD' },
    { title: 'How do I find a coach?', description: 'All of our coaches are located in the coaching catalogue, feel free to look at their bios, price, and reviews to help you decide which one works best for you!' },
    { title: 'What games are available?', description: 'There are all-time, monthly, and weekly games running in our basic membership. Weekly and Monthly competitions are reset every week and month, respectfully.' },
    { title: 'How do I win?', description: 'Enroll in a simulator in the “simulator” tab at the top of the website and compete against other users. Watch the leaderboard page to see how you rank against your fellow competitors.' },
    { title: 'What does Finberry mean?', description: 'The “Fin” in Finberry is for finance because we are helping people achieve financial literacy. The “berry” in Finberry is because we are berry excited for you to be here!' },
    { title: 'Have additional questions?', description: 'Contact us using the “contact us” button at the bottom of the website and we will try to answer any additional questions!' },
];

const FaqPage = () => {
    return (
        <div>
            <Container
                sx={{
                    backgroundColor: 'primary.main',
                    minHeight: '100vh',
                    minWidth: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '3rem',
                    boxShadow: '0 4px 15px -6px black',
                    marginBottom: '1rem',
                    paddingTop: '5rem',
                    paddingBottom: '2rem'
                }}
            >
                <Box
                    display={"flex"}
                    sx={{
                        backgroundColor: 'white',
                        borderRadius: "1rem",
                        width: { xs: "100%", sm: "100%", md: "75%", lg: "75%" },
                        margin: { sm: "0rem", lg: "3rem" },
                        paddingBottom: "3rem"
                    }}
                ><Grid container>
                        <Grid xs={2}></Grid>
                        <Grid xs={8}>
                            <Typography variant="h3" align="center" fontWeight={400} padding={"2rem 0"}>
                                Frequently Asked Questions
                            </Typography>
                            {faqs.map((faq, index) => (
                                <Accordion>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls={"panel" + index + "-content"}
                                        id={"panel" + index + "-header"}
                                    >
                                        <Typography>{faq.title}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography>
                                            {faq.description}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Grid>
                        <Grid xs={2}></Grid>
                    </Grid></Box>
            </Container>
        </div>
    )
}

export default FaqPage
