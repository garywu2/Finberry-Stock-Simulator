import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material'
import TeamPhoto from '../../images/photos/team-photo.jpg'

interface Bio {
  name: string
  description: string
}

const bios: Bio[] = [
    { name: 'Haseeb Khan', description: 'Hello! I enjoy travelling, photography, bouldering, and spontaneous adventures with friends and family. The potential for creating entrepreneurial products and solutions excites me greatly.' },
    { name: 'Brooke Mitchell', description: 'Hi, I\'m Brooke. Ever since I was a kid running my own lemonade stands, I have been fascinated with the idea of entrepreneurial work and self-employment. I am a creative individual and I believe this helps me come up with innovative business ideas and creative solutions to potential problems. I love using Finberry to refine my investment skills and to compete against my fellow founders!' },
    { name: 'Gary Wu', description: 'I am in my fourth year of a Software Engineering degree. Through previous internship experiences and projects, I’ve had experience with back-end development and the infrastructure side of the application. The primary languages I worked with include React, Express and a variety of different AWS infrastructures.' },
    { name: 'Pin Hong Long', description: 'Hello I am Pin Hong Long, or simply Daniel. I have been fascinated with technology from very early on, this led to my early interest in computers and programming. This is evident by my strong interest in anything technology-related like video games, applications, and websites. With my interest in those fields, I believe it will be very helpful for Finberry.' },
    { name: 'Muhammad Tariq', description: 'Hi I’m Muhammad Hassan Tariq. I have always been fascinated with computers and different technologies and recently crypto and fintech which led to the idea of our capstone project. I have also always believed in the entrepreneurial spirit and taking meaningful ideas to truly impact the world. Outside of school or work I like playing competitive games whether that be video games, sports, or board games and I also like travelling and spending time with friends and family.' }
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
          paddingBottom: '2rem',
        }}
      >
        <Box
          display={'flex'}
          sx={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            width: '100%',
            margin: { sm: '0rem', lg: '3rem' },
            paddingBottom: '3rem',
          }}
        >
          <Grid container>
            <Grid xs={2}></Grid>
            <Grid xs={8}>
              <Typography
                variant='h3'
                align='center'
                fontWeight={400}
                padding={'2rem 0'}
              >
                About Us
              </Typography>
              <Typography
                variant='h5'
                align='center'
                color='text.secondary'
                paragraph
              >
                Founded in 2022 by friends from the University of Calgary,
                Finberry offers a free, hands-on experience for learning about
                investing through stock trading simulations, without risking
                your own money.
              </Typography>
            </Grid>
            <Grid xs={2}></Grid>
            <Container>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <CardMedia
                        component='img'
                        image={TeamPhoto}
                        alt='random'
                        sx={{
                          width: '100%',
                          borderRadius: '1rem',
                          marginBottom: '1rem',
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                {bios.map((bio, index) => (
                  <Grid item key={index} xs={12} sm={6} md={3}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <CardMedia
                          component='img'
                          image='https://source.unsplash.com/random'
                          alt='random'
                          sx={{
                            height: '15rem',
                            width: '100%',
                            borderRadius: '1rem',
                            marginBottom: '1rem',
                          }}
                        />
                        <Typography
                          gutterBottom
                          variant='h5'
                          align='center'
                          component='h2'
                        >
                          {bio.name}
                        </Typography>
                        <Typography>{bio.description}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Grid>
        </Box>
      </Container>
    </div>
  )
}

export default AboutPage
