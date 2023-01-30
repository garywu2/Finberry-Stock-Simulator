import Header from '../../components/Header';

const links = [
    { label: 'Login', path: '/login' },
    { label: 'Register', path: '/register' },
];

const HomePage = () => {
    return (
        <div>
            <Header title="Finberry" links={links} />
            <h1>
                Finberry Home Page
            </h1>
            <p>
                YEET
            </p>
        </div>
    )
}

export default HomePage;