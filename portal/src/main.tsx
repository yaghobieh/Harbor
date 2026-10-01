import React from 'react';
import ReactDOM from 'react-dom/client';
import '@forgedevstack/bear/styles.css';
import '@forgedevstack/torch/styles.css';
import { BearProvider } from '@forgedevstack/bear';
import { App } from './App';
import { harborTheme, harborVariants } from './config/bear-theme';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BearProvider
      defaultMode="dark"
      theme={harborTheme}
      customVariants={harborVariants}
      persistPreference
      storageKey="harbor-theme"
    >
      <App />
    </BearProvider>
  </React.StrictMode>
);
