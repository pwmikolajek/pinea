import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from './core/components/LandingPage';
import RobinApp from './apps/robin/pages/RobinApp';
import FalconApp from './apps/falcon/pages/FalconApp';
import SwiftApp from './apps/swift/pages/SwiftApp';
import { sparrowRoutes } from './apps/sparrow/routes';
import './core/styles/index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/image-to-pdf',
    element: <RobinApp />,
  },
  {
    path: '/pdf-to-jpeg',
    element: <FalconApp />,
  },
  {
    path: '/yt-dlp',
    element: <SwiftApp />,
  },
  ...sparrowRoutes
]);

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
);