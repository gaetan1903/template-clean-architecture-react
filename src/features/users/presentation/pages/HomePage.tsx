import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                }}
            >
                <Typography variant="h2" component="h1" gutterBottom>
                    🏗️ Clean Architecture React Template
                </Typography>
                <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 2, mb: 4, color: 'text.secondary' }}>
                    Un template complet pour créer des applications React + TypeScript
                    <br />
                    avec une architecture propre et maintenable
                </Typography>

                <Box sx={{ mt: 4 }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/users')}
                        sx={{ mr: 2 }}
                    >
                        Voir l'exemple (Users)
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        href="https://github.com"
                        target="_blank"
                    >
                        Documentation
                    </Button>
                </Box>

                <Box sx={{ mt: 8 }}>
                    <Typography variant="h6" gutterBottom>
                        Caractéristiques principales
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Box>
                            <Typography variant="body1">⚛️ React 18 + TypeScript</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body1">🏛️ Clean Architecture</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body1">🔄 Redux Toolkit</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body1">🎨 Material-UI v6</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body1">✅ Either Monad</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

export default HomePage;
