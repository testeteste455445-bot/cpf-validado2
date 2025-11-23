import React from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StickySponsor } from './components/StickySponsor';
import { RegistrationForm } from './components/RegistrationForm';

const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <StickySponsor />
      
      <main className="flex-grow relative">
        {/* Page Header visual placeholder */}
        <div className="w-full h-24 bg-theme-quaternary border-b border-gray-200 mb-8"></div>
        
        <div className="container mx-auto px-4 pb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-theme-dark font-sans">
              Seja Bem-vindo ao Registro de associados
            </h3>
          </div>

          <div className="max-w-6xl mx-auto">
            <RegistrationForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;