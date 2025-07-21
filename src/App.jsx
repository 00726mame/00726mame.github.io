import React from 'react';
// ▼▼▼ 変更点: BrowserRouterをHashRouterに変更 ▼▼▼
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import SimpleBudgetApp from './components/SimpleBudgetApp';
import SmartPlannerAI from './components/SmartPlannerAI';
import './App.css';

function App() {
  // HashRouterはbasenameを自動で正しく処理するため、手動設定は不要です。
  const basename = import.meta.env.BASE_URL;
  console.log('Router basename:', basename);
  
  return (
    // ▼▼▼ 変更点: <BrowserRouter> を <Router> (HashRouter) に変更 ▼▼▼
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