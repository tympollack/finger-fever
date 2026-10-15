import React from 'react';
import { ArcadeStage } from './components/ArcadeStage';

export const App: React.FC = () => {
  return (
    <main className="w-full h-full min-h-screen">
      <ArcadeStage />
    </main>
  );
};

export default App;
