import React from 'react';
import { AppRoot } from './src/app/AppRoot';
import { EditInRendererPackageDemo } from './src/demos/EditInRendererPackageDemo';

const App: React.FC = () => {
  const isEditInRendererDemo =
    window.location.pathname.endsWith('/demos/edit-in-renderer')
    || window.location.search.includes('demo=edit-in-renderer');

  return isEditInRendererDemo ? <EditInRendererPackageDemo /> : <AppRoot />;
};

export default App;
