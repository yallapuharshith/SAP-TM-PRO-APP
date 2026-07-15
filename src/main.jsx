import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';

const baseUrl = import.meta.env.BASE_URL;
const basePath = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

if (!window.location.hash) {
  let routePath = window.location.pathname;

  if (basePath && routePath.startsWith(basePath)) {
    routePath = routePath.slice(basePath.length) || '/';
  }

  if (routePath !== '/') {
    const normalizedRoute = routePath.startsWith('/') ? routePath : `/${routePath}`;
    const target = `${basePath || ''}/#${normalizedRoute}${window.location.search}`;
    window.history.replaceState(null, '', target);
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    // Always remove previously registered service workers/caches to avoid stale
    // GitHub Pages assets after new deployments.
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));

      if ('caches' in window) {
        const keys = await window.caches.keys();
        await Promise.all(
          keys
            .filter((key) => key.startsWith('sap-tm-master-pro'))
            .map((key) => window.caches.delete(key))
        );
      }
    } catch {
      // Ignore cleanup errors.
    }
  });
}
