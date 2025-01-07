import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Route, BrowserRouter as Router, Routes } from "react-router";
import './styles/reset.scss';
import ROUTES from './config/routes';
import Home from './pages/Home/Home';
import Chat from './pages/Chat/Chat';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.CHAT} element={<Chat />} />
      </Routes>
    </Router>
  </StrictMode>,
)
