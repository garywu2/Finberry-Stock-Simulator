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
    { title: 'Sample FAQ', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.' },
    { title: 'Sample FAQ', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.' },
    { title: 'Sample FAQ', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.' },
    { title: 'Sample FAQ', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.' },
    { title: 'Sample FAQ', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.' },
    { title: 'Sample FAQ', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.' },
    { title: 'Sample FAQ', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.' },
    { title: 'Sample FAQ', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.' },
    { title: 'Sample FAQ', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.' },
    { title: 'Sample FAQ', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.' },
    { title: 'Sample FAQ', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.' },
    { title: 'Sample FAQ', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.' },
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
                    borderRadius: '0 0 3rem 3rem',
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
                        width: "100%",
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
