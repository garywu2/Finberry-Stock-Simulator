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
  title: string
}

const bios: Bio[] = [
  {
    name: 'Haseeb Khan',
    title: 'Software Engineer',
    description:
      'Hello! I enjoy travelling, photography, bouldering, and spontaneous adventures with friends and family. The potential for creating entrepreneurial products and solutions excites me greatly.',
  },
  {
    name: 'Gary Wu',
    title: 'Software Engineer',
    description:
      "Hey there! I'm Gary, I have a lot of experience in back-end development and infrastructure. I've worked with React, Express, and various AWS platforms in internships and projects",
  },
  {
    name: 'Brooke Mitchell',
    title: 'Electrical Engineer',
    description:
      "I'm Brooke, a creative individual who's had a passion for entrepreneurship since childhood. Finberry helps me refine my investment skills and compete with my fellow founders.",
  },
  {
    name: 'Pin Hong Long',
    title: 'Software Engineer',
    description:
      "Hi, I'm Pin Hong Long, but you can call me Daniel. I've always been interested in computers, programming, and technology-related areas such as video games, apps, and websites.",
  },
  {
    name: 'Muhammad Tariq',
    title: 'Software Engineer',
    description:
      "I'm Muhammad, passionate about tech, crypto, and fintech. I believe in entrepreneurship, meaningful ideas, and love playing competitive games, traveling, and spending time with loved ones.",
  },
]

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
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '1rem',
            width: '100%',
            margin: { sm: '0rem', lg: '3rem' },
          }}
        >
          <Grid container sx={{ margin: '2rem' }}>
            <Grid xs={1}></Grid>
            <Grid xs={10}>
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
            <Grid xs={1}></Grid>
            <Grid item xs={12}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <CardMedia
                    component='img'
                    image={TeamPhoto}
                    alt='Team photo'
                    sx={{
                      borderRadius: '1rem',
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid container spacing={2}>
              {bios.map((bio, index) => (
                <Grid item key={index} xs={12} sm={12} md={2.4}>
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
                      <Typography gutterBottom variant='h5' fontWeight={'bold'}>
                        {bio.name}
                      </Typography>
                      <Typography
                        gutterBottom
                        variant='subtitle1'
                        fontWeight={'bold'}
                      >
                        {bio.title}
                      </Typography>
                      <Typography>{bio.description}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Box>
      </Container>
    </div>
  )
}

export default AboutPage
