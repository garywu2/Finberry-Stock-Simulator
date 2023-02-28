import {
    Box,
    Container,
    Grid,
    Typography,

} from '@mui/material'



import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';


interface Bio {
    name: string;
    description: string;
}

const bios: Bio[] = [
    { name: 'Haseeb Khan', description: 'Hello! I’m Haseeb Khan, studying my fifth and final year of Software Engineering at the University of Calgary. I have completed internships at TD Insurance, QuirkLogic, and Replicon where, in addition to technical skills, I gained valuable experience with working in team environments. Outside of the school and work environments, I enjoy travelling, photography, bouldering, and spontaneous adventures with friends and family. The potential for creating entrepreneurial products and solutions excites me greatly.' },
    { name: 'Brooke Mitchell', description: 'Hi I’m Brooke! I am in my final year of Electrical Engineering at the University of Calgary. I am a quick learner and work hard to overcome any challenges that come my way. I have hardware design experience and love to fix electrical equipment at home with my refined soldering skills. Ever since I was a kid running my own lemonade stands, I have been fascinated with the idea of entrepreneurial work and self-employment. I am a creative individual and I believe this helps me come up with innovative business ideas and creative solutions to potential problems. I love using Finberry to refine my investment skills and to compete against my fellow founders!' },
    { name: 'Gary Wu', description: 'I am in my fourth year of a Software Engineering degree. Through previous internship experiences and projects, I’ve had experience with back-end development and the infrastructure side of the application. The primary languages I worked with include React, Express and a variety of different AWS infrastructures.' },
    { name: 'Daniel (Pin Hong Long)', description: 'Hello I am Pin Hong Long, or simply Daniel. I am studying for my fifth and final year of Software Engineering at the University of Calgary. I have gained key technical and teamworking skills and experiences during my self-study, internship experience, and my educational career. From these experiences, I have gained hands-on experience in GIT, Web development, Python, Machine Learning, C, C++, C#, and Java. I have been fascinated with technology from very early on, this led to my early interest in computers and programming. This is evident by my strong interest in anything technology-related like video games, applications, and websites. With my interest in those fields, I believe it will be very helpful for Finberry.' },
    { name: 'Muhammad Tariq', description: 'Hi I’m Muhammad Hassan Tariq. I am in my final year of Software Engineering at the University of Calgary. Through my first internship at TELUS, I was able to gain some experience in the field of data science and machine learning, with specific skills in python for data science, SQL, and the google cloud platform. In my second internship at General Motors, I gained hands-on experience as a back-end developer with skills in software developer best practices, agile methodology, and programming with C#. I have always been fascinated with computers and different technologies and recently crypto and fintech which led to the idea of our capstone project. I have also always believed in the entrepreneurial spirit and taking meaningful ideas to truly impact the world. Outside of school or work I like playing competitive games whether that be video games, sports, or board games and I also like travelling and spending time with friends and family.' }
];

const AboutPage = () => {
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
                        width: "100%",
                        margin: { sm: "0rem", lg: "3rem" },
                        paddingBottom: "3rem"
                    }}
                >
                    <Grid container>
                        <Grid xs={2}></Grid>
                        <Grid xs={8}>
                            <Typography variant="h3" align="center" fontWeight={400} padding={"2rem 0"}>
                                About Us
                            </Typography>
                            <Typography variant="h5" align="center" color="text.secondary" paragraph>
                                Finberry was founded in 2022 by a group of friends who found it difficult to break into the world of investing. With so many contradicting resources available and limited funds, we didn’t want to invest our money without practicing beforehand. There were many simulated investing apps but they were not fun and not free. We didn’t want to feel like it was a job to learn how to invest and instead wanted to create a website that provided a fun and hands-on experience to learn how to trade stocks and invest money.

                                Finberry is making investing sweet and simple by providing both literary and gamified resources for users to gain more investing experience and become financially empowered. This is all encapsulated in a free web application so that you only have to focus on learning and winning.

                                Welcome to Finberry, we're happy to have you here! Let’s learn together! :)

                            </Typography>
                        </Grid>
                        <Grid xs={2}></Grid>
                        <Container>
                        <Grid container spacing={2}>

                            {/* <Grid xs={12}> */}
                                {bios.map((bio, index) => (
                                <Grid item key={index} xs={12} sm={6} md={4}>
                                    <Card
                                        sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}
                                    >
                                        <CardMedia
                                            component="img"
                                            image="https://source.unsplash.com/random"
                                            alt="random"
                                        />
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography gutterBottom variant="h5" component="h2">
                                                {bio.name}
                                            </Typography>
                                            <Typography>
                                                {bio.description}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                            {/* </Grid> */}
                            </Grid>
                        </Container>
                    </Grid></Box>
            </Container>
        </div>
    )
}

export default AboutPage
