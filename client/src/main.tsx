import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import SearchPage from './routes/SearchPage';
import PhotoDetail from './routes/PhotoDetail';
import './styles.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root not found');

createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<SearchPage />} />
          <Route path="photo/:id" element={<PhotoDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
