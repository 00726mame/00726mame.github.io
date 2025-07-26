import React from 'react';
// ▼▼▼ 変更点: BrowserRouterをHashRouterに変更 ▼▼▼
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import SimpleBudgetApp from './components/SimpleBudgetApp';
import SmartPlannerAI from './components/SmartPlannerAI';
// import SmartShopperAI from './components/SmartShopperAI';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/budget" element={<SimpleBudgetApp />} />
        <Route path="/planner" element={<SmartPlannerAI />} />
      </Routes>
    </Router>
  );
}

export default App;