import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TopBar from './components/TopBar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import FindTreasuries from './pages/FindTreasuries';
import Proposals from './pages/Proposals';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <TopBar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/treasuries" element={<FindTreasuries />} />
            <Route path="/treasuries/find" element={<Navigate to="/treasuries" replace />} />
            <Route path="/treasuries/:treasuryId/proposals" element={<Proposals />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
