import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { RouterProvider } from 'react-router-dom';
import router from './rotues/index'; 
import { Provider } from 'react-redux';
import { store } from './redux/store';

const rootElement = document.getElementById('root'); // Ensure this matches the ID in your HTML
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <RouterProvider router={router}>
          <App />
        </RouterProvider>
      </Provider>
    </React.StrictMode>
  );
} else {
  console.error("Root element not found. Ensure there is a div with id='root' in your index.html");
}

reportWebVitals();
