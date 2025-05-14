import React from 'react';
import Navbar from '@/components/Navbar';
import CreatePresentationForm from '@/components/CreatePresentationForm';

const CreatePresentation = () => {
  return (
    <div className="min-h-screen noise-bg flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-black">
            Create Presentation
          </h1>
          <p className="text-gray-700 max-w-md mx-auto">
            Describe your topic and our AI will generate a professional presentation
          </p>
        </div>
        
        <div className="w-full max-w-2xl mx-auto">
          <div className="glass-panel p-6 md:p-8">
            <CreatePresentationForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePresentation;
