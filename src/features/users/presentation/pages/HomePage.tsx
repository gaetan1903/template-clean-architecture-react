import React from 'react';
import { Button, Chip } from '@heroui/react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    const features = [
        'React 19 + TypeScript',
        'Clean Architecture',
        'Zustand',
        'HeroUI v3',
        'Tailwind CSS v4',
        'Either Monad',
    ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-5xl font-bold mb-4">
                Clean Architecture React Template
            </h1>
            <p className="text-xl text-neutral-500 max-w-xl mb-10">
                Un template complet pour creer des applications React + TypeScript
                avec une architecture propre et maintenable
            </p>

            <div className="flex gap-3 mb-16">
                <Button variant="primary" size="lg" onPress={() => navigate('/users')}>
                    Voir l'exemple (Users)
                </Button>
                <Button variant="outline" size="lg" as="a" href="https://github.com" target="_blank">
                    Documentation
                </Button>
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-4">
                    Caracteristiques principales
                </h2>
                <div className="flex flex-wrap gap-2 justify-center">
                    {features.map((feature) => (
                        <Chip key={feature} variant="secondary">
                            {feature}
                        </Chip>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
