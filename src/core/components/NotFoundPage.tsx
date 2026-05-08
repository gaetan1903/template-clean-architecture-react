import React from 'react';
import { Button } from '@heroui/react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-9xl font-bold text-neutral-200">404</h1>
            <h2 className="text-2xl font-semibold mt-4 mb-2">Page non trouvee</h2>
            <p className="text-neutral-500 mb-8">
                La page que vous recherchez n'existe pas ou a ete deplacee.
            </p>
            <Button variant="primary" onPress={() => navigate('/')}>
                Retour a l'accueil
            </Button>
        </div>
    );
};

export default NotFoundPage;
