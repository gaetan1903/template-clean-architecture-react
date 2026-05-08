import { Button, Chip } from '@heroui/react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
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
            <p className="text-xl text-secondary max-w-xl mb-10">
                Un template complet pour creer des applications React + TypeScript
                avec une architecture propre et maintenable
            </p>

            <div className="flex gap-3 mb-16">
                <Button variant="primary" size="lg" onPress={() => navigate('/users')}>
                    Voir l'exemple (Users)
                </Button>
                <a
                    href="https://github.com/gaetan-bloch/template-clean-architecture-react"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 h-11 rounded-md border border-current text-sm font-medium transition-opacity hover:opacity-80"
                >
                    Documentation
                </a>
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
