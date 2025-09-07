
import React from 'react';
import ThreeScene from './components/ThreeScene';

const App: React.FC = () => {
  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      <ThreeScene />
      <header className="absolute bottom-12 inset-x-0 text-white pointer-events-none flex flex-col items-center">
        <h1 className="text-4xl font-bold">X . O . N</h1>
        <p className="text-sm font-light tracking-[0.4em] mt-2 text-gray-400">CLOUD GAMING</p>
      </header>
    </div>
  );
};

export default App;