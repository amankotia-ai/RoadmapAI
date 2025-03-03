import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, RouteObject } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import App from './App.tsx';
import { History } from './pages/History.tsx';
import { Pricing } from './pages/Pricing.tsx';
import { VectorAdmin } from './pages/VectorAdmin.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <RouterProvider 
        router={createBrowserRouter([
          {
            path: '/',
            element: <App />,
          },
          {
            path: '/history',
            element: <History />,
          },
          {
            path: '/pricing',
            element: <Pricing />,
          },
          {
            path: '/vector-admin',
            element: <VectorAdmin />,
          },
        ])}
      />
    </AppProvider>
  </React.StrictMode>
);
