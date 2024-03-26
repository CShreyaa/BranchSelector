import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import Authentication from './pages/Authentication.jsx';

const router = createBrowserRouter ([
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: 'auth',
    element: <Authentication />
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
