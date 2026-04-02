import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

/**
 * Page 404 — Route non trouvée
 */
const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm">
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
            }}>
                <Typography variant="h1" component="h1" sx={{ fontSize: '6rem', fontWeight: 'bold' }}>
                    404
                </Typography>
                <Typography variant="h5" gutterBottom color="text.secondary">
                    Page non trouvée
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    La page que vous recherchez n'existe pas ou a été déplacée.
                </Typography>
                <Button variant="contained" onClick={() => navigate('/')}>
                    Retour à l'accueil
                </Button>
            </Box>
        </Container>
    );
};

export default NotFoundPage;
