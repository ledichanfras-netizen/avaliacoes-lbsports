
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';
import { Toaster } from 'react-hot-toast';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
    <Toaster 
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        className: '',
        style: {
          background: '#334155',
          color: '#fff',
        },
      }}
    />
  </React.StrictMode>
);
