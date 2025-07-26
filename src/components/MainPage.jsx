import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Settings, Sun, Moon } from 'lucide-react';

const MainPage = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedDarkMode || (localStorage.getItem('darkMode') === null && prefersDark);
    
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    showNotification(newDarkMode ? 'ダークモードを有効にしました' : 'ライトモードを有効にしました');
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openApp = (appName) => {
    try {
      navigate(`/${appName}`);
    } catch {
      showNotification('アプリの起動に失敗しました', 'error');
    }
  };

  return (
    // ★★★ 修正点: SimpleBudgetAppと同様のスタイルを適用 ★★★
    <div 
      className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors"
      style={{position: 'fixed', width: '100%', height: '100%', overflow: 'auto'}}
    >
      {/* 通知エリア */}
      {notification && (
        <div className="fixed top-4 left-4 right-4 z-50">
          <div className={`p-4 rounded-lg shadow-lg border ${
            notification.type === 'success' ? 'bg-green-100 text-green-800 border-green-300' :
            notification.type === 'error' ? 'bg-red-100 text-red-800 border-red-300' :
            notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
            'bg-blue-100 text-blue-800 border-blue-300'
          }`}>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* ★★★ 修正点: コンテンツが見切れないようにpadding-bottomを追加 ★★★ */}
      <div className="max-w-md mx-auto p-4" style={{paddingBottom: '40px'}}>
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Wallet className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Household Finance Apps
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            お金の管理をもっとスマートに
          </p>
        </div>

        {/* アプリリスト */}
        <div className="space-y-4 mb-8">
          {/* Simple Budget App */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI家計簿</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Simple Budget App</p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              レシート読み取り、AI分析、チャット機能を備えた高機能家計簿アプリ
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">レシート読み取り</span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-full">AI分析</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">予算提案</span>
            </div>
            <button 
              onClick={() => openApp('budget')} 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md transition-colors font-semibold"
            >
              アプリを開く
            </button>
          </div>

          {/* Smart Planner AI */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">スマート計画立てAI</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Smart Planner AI</p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              AIとマップ連携で効率的な予定作成。天気情報も考慮した最適なスケジュール提案
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">AI計画作成</span>
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded-full">マップ連携</span>
              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs rounded-full">天気考慮</span>
            </div>
            <button 
              onClick={() => openApp('planner')} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition-colors font-semibold"
            >
              アプリを開く
            </button>
          </div>

          {/* SmartShopperAIカード削除 */}
        </div>

        {/* フッター */}
        <div className="text-center">
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleDarkMode} 
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="テーマ切替"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400">（端末設定とアプリ内切替どちらも対応）</span>
            </div>
            <span className="text-xs text-gray-400">端末のダーク/ライト設定に自動追従。アプリ内でも切替可能。</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Created with ❤️ for better financial management
          </p>
        </div>
      </div>
    </div>
  );
};

export default MainPage;