import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import App from './App';
import PdfToJpeg from './pages/PdfToJpeg';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/image-to-pdf',
    element: <App />,
  },
  {
    path: '/pdf-to-jpeg',
    element: <PdfToJpeg />,
  }
]);

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
);