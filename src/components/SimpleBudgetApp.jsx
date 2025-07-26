/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, MinusCircle, Wallet, TrendingUp, TrendingDown, Calendar, Download, Upload, Settings, BarChart3, Filter, Search, RefreshCw, RefreshCcw , Database, Eye, EyeOff, Menu, X, Check, Info, AlertCircle, Trash2, Edit3, Home, Car, Utensils, ShoppingCart, Heart, Briefcase, GraduationCap, Plane, Coffee, Gift, Music, Smartphone, Gamepad2, Sun, Moon, Brain, Loader, ChevronDown, ChevronUp,  Camera, Circle, Target, PiggyBank } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Tesseract from 'tesseract.js';

// Colors for charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347'];

// ★★★★★ CameraModalコンポーネント: カメラフィードを表示しキャプチャする ★★★★★
const CameraModal = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
        .catch(console.error);
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);
  if (!isOpen) return null;
  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/png');
    onCapture(imageData);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg">
        <video ref={videoRef} autoPlay playsInline className="w-80 h-60" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="mt-2 flex justify-between">
          <button onClick={handleCapture} className="px-4 py-2 bg-blue-600 text-white rounded">キャプチャ</button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">閉じる</button>
        </div>
      </div>
    </div>
  );
};

// ★★★★★ AI予算プランナーのモーダル ★★★★★
const BudgetPlannerModal = ({ isOpen, onClose, budget, formatAmount }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <PiggyBank className="text-blue-500" size={24} />
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">AI予算プラン提案</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            過去の支出データを元に、AIが現実的な月間予算案を作成しました。
          </p>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {budget ? (
              Object.entries(budget).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{category}</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{formatAmount(amount)}</span>
                </div>
              ))
            ) : (
              <p>予算データがありません。</p>
            )}
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NavigationBar = ({ darkMode, currentView, setCurrentView }) => (
    <div className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t`} style={{zIndex: 1000}}>
      <div className="flex justify-around py-2" style={{maxWidth: '400px', margin: '0 auto'}}>
        <button
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center py-2 px-2 rounded ${
            currentView === 'home'
              ? 'text-blue-600'
              : darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
          style={{minHeight: '60px'}}
        >
          <Home size={20} />
          <span className="text-xs mt-1">ホーム</span>
        </button>
  
        <button
          onClick={() => setCurrentView('add')}
          className={`flex flex-col items-center py-2 px-2 rounded ${
            currentView === 'add'
              ? 'text-blue-600'
              : darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
          style={{minHeight: '60px'}}
        >
          <PlusCircle size={20} />
          <span className="text-xs mt-1">追加</span>
        </button>
  
        <button
          onClick={() => setCurrentView('aiAnalysis')}
          className={`flex flex-col items-center py-2 px-2 rounded ${
            currentView === 'aiAnalysis'
              ? 'text-purple-600'
              : darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
          style={{minHeight: '60px'}}
        >
          <Brain size={20} />
          <span className="text-xs mt-1">AI分析</span>
        </button>
  
        <button
          onClick={() => setCurrentView('stats')}
          className={`flex flex-col items-center py-2 px-2 rounded ${
            currentView === 'stats'
              ? 'text-blue-600'
              : darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
          style={{minHeight: '60px'}}
        >
          <BarChart3 size={20} />
          <span className="text-xs mt-1">統計</span>
        </button>
  
        <button
          onClick={() => setCurrentView('settings')}
          className={`flex flex-col items-center py-2 px-2 rounded ${
            currentView === 'settings'
              ? 'text-blue-600'
              : darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
          style={{minHeight: '60px'}}
        >
          <Settings size={20} />
          <span className="text-xs mt-1">設定</span>
        </button>
      </div>
    </div>
  );
  
  const HomeView = ({
    darkMode, balance, formatAmount, monthlyIncome, monthlyExpense, searchTerm, setSearchTerm,
    showFilters, setShowFilters, filterCategory, setFilterCategory, filterType, setFilterType,
    categories, filteredTransactions, categoryIcons, formatDate, deleteTransaction, transactions,
    showTransactionDetails
  }) => (
    <div className="pb-20">
      {/* 残高表示 */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-4`}>
        <div className="text-center">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>現在の残高</p>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatAmount(balance)}
          </p>
        </div>
      </div>
  
      {/* 月次サマリー */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>今月収入</p>
              <p className="text-xl font-bold text-green-600">{formatAmount(monthlyIncome)}</p>
            </div>
            <TrendingUp className="text-green-600" size={24} />
          </div>
        </div>
  
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>今月支出</p>
              <p className="text-xl font-bold text-red-600">{formatAmount(monthlyExpense)}</p>
            </div>
            <TrendingDown className="text-red-600" size={24} />
          </div>
        </div>
      </div>
  
      {/* 検索・フィルター */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 mb-4`}>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="取引を検索..."
            className={`flex-1 px-3 py-2 border rounded-md ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300'
            }`}
            autoComplete="off"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-md ${
              showFilters
                ? 'bg-blue-600 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-200 text-gray-700'
            }`}
          >
            <Filter size={20} />
          </button>
        </div>
  
        {showFilters && (
          <div className="grid grid-cols-2 gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`px-3 py-2 border rounded-md ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="">すべてのカテゴリー</option>
              {[...categories.income, ...categories.expense].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
  
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-3 py-2 border rounded-md ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="">すべてのタイプ</option>
              <option value="income">収入</option>
              <option value="expense">支出</option>
            </select>
          </div>
        )}
      </div>
  
      {/* 取引履歴 */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            取引履歴
          </h2>
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {filteredTransactions.length} 件
          </span>
        </div>
  
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {filteredTransactions.length === 0 ? (
            <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {transactions.length === 0 ? '取引履歴がありません' : '該当する取引がありません'}
            </p>
          ) : (
            filteredTransactions.map((transaction) => {
              const IconComponent = categoryIcons[transaction.category] || Coffee;
              const details = transaction.details || transaction.description || ''; // 旧データ対応
              return (
                <div
                  key={transaction.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => showTransactionDetails(transaction)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'income'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      <IconComponent size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {details.split('\n')[0] || '詳細なし'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {transaction.category}
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDate(transaction.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatAmount(transaction.amount)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTransaction(transaction.id);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
  
const AddView = ({
  darkMode, type, setType, amount, setAmount, category, setCategory,
  setShowCategoryManager, categories, details, setDetails, date, setDate, addTransaction,
  geminiApiKey, showNotification
}) => {
  // レシート読み込み用の状態
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isReadingReceipt, setIsReadingReceipt] = useState(false);

  return (
    <>  
      {/* CameraModal for receipt capture */}
      <CameraModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={async (imageDataUrl) => {
          setShowCameraModal(false);
          setIsReadingReceipt(true);
          try {
            // OCR解析
            const { data: { text } } = await Tesseract.recognize(imageDataUrl, 'jpn');
            setDetails(text);
            showNotification('レシートからテキストを読み取りました', 'success');
          } catch (err) {
            console.error(err);
            showNotification('レシート読み取りに失敗しました', 'error');
          } finally {
            setIsReadingReceipt(false);
          }
        }}
      />
      {/* 解析中オーバーレイ */}
      {isReadingReceipt && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-10">
          <Loader size={48} className="text-white animate-spin" />
          <p className="text-white mt-4">レシートを解析中...</p>
        </div>
      )}
      <div className="pb-20 relative">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>取引を追加</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCameraModal(true)}
                className="bg-indigo-600 text-white py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1"
              >
                <Camera size={16} />
                カメラで読取
              </button>
              <button
                onClick={addTransaction}
                className="bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <Check size={16} />
                取引を追加
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {/* 取引タイプ */}
            <div className="flex gap-4">
              <label className="flex items-center flex-1">
                <input
                  type="radio"
                  value="income"
                  checked={type === 'income'}
                  onChange={e => { setType(e.target.value); setCategory(''); }}
                  className="mr-2"
                />
                <span className="text-green-600 font-semibold">収入</span>
              </label>
              <label className="flex items-center flex-1">
                <input
                  type="radio"
                  value="expense"
                  checked={type === 'expense'}
                  onChange={e => { setType(e.target.value); setCategory(''); }}
                  className="mr-2"
                />
                <span className="text-red-600 font-semibold">支出</span>
              </label>
            </div>
            {/* 金額 */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>金額</label>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="金額を入力"
                className={`w-full px-3 py-3 border rounded-md text-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                autoComplete="off"
              />
            </div>
            {/* カテゴリー */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>カテゴリー</label>
              <select
                value={category}
                onChange={e => {
                  if (e.target.value === '__ADD_NEW__') {
                    setShowCategoryManager(true);
                  } else {
                    setCategory(e.target.value);
                  }
                }}
                className={`w-full px-3 py-3 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="">カテゴリーを選択</option>
                {categories[type].map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                <option value="__ADD_NEW__" className="text-blue-600 font-medium">➕ 新しいカテゴリを追加</option>
              </select>
            </div>
            {/* 詳細 */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>詳細</label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder={`詳細を入力\n例：\n・商品名\n・購入場所\n・メモ`}
                rows={4}
                className={`w-full px-3 py-3 border rounded-md resize-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                autoComplete="off"
              />
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>買ったものの詳細、場所、メモなどを自由に記入できます</p>
            </div>
            {/* 日付 */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>日付</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={`w-full px-3 py-3 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const AIAnalysisView = ({ darkMode, transactions, formatAmount, categories, monthlyIncome, monthlyExpense, geminiApiKey, showNotification }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    predictions: true,
    insights: true,
    recommendations: true
  });

  // --- AIチャット用の新しいState ---
  const [chatHistory, setChatHistory] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatContainerRef = useRef(null);

  // チャットが更新されたら一番下にスクロール
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('ai_analysis_history');
    if (savedHistory) {
      try {
        setAnalysisHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load analysis history:', error);
      }
    }
  }, []);

  const saveAnalysisHistory = (newAnalysis) => {
    const updatedHistory = [newAnalysis, ...analysisHistory.slice(0, 9)];
    setAnalysisHistory(updatedHistory);
    localStorage.setItem('ai_analysis_history', JSON.stringify(updatedHistory));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const prepareAnalysisData = () => {
    if (transactions.length === 0) return null;

    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

    const monthlyData = {};
    const categoryData = {};
    const categoryExpenseData = {};
    let totalExpense = 0;

    transactions.forEach(t => {
      const month = t.date.slice(0, 7);
      
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0, count: 0 };
      }
      monthlyData[month][t.type] += t.amount;
      monthlyData[month].count += 1;

      if (!categoryData[t.category]) {
        categoryData[t.category] = { income: 0, expense: 0, count: 0, type: t.type };
      }
      categoryData[t.category][t.type] += t.amount;
      categoryData[t.category].count += 1;

      if (t.type === 'expense') {
        if (!categoryExpenseData[t.category]) {
          categoryExpenseData[t.category] = 0;
        }
        categoryExpenseData[t.category] += t.amount;
        totalExpense += t.amount;
      }
    });

    const currentMonthData = monthlyData[currentMonth] || { income: 0, expense: 0, count: 0 };
    
    const categoryBreakdown = Object.keys(categoryExpenseData)
      .map(category => ({
        category,
        amount: categoryExpenseData[category],
        percentage: totalExpense > 0 ? Math.round((categoryExpenseData[category] / totalExpense) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);

    return {
      totalTransactions: transactions.length,
      currentMonth,
      monthlyData,
      categoryBreakdown,
      currentMonthIncome: currentMonthData.income,
      currentMonthExpense: currentMonthData.expense,
    };
  };

  const runAIAnalysis = async () => {
    if (!geminiApiKey.trim()) {
      showNotification('Gemini API KEYが設定されていません。設定画面でAPI KEYを入力してください。', 'warning');
      return;
    }
    
    const analysisData = prepareAnalysisData();
    if (!analysisData) {
      showNotification('分析するデータがありません。取引を追加してから再実行してください。', 'warning');
      return;
    }

    setIsAnalyzing(true);
    setChatHistory([]); // 分析実行時にチャット履歴をクリア
    
    try {
      const prompt = `
家計簿データを分析して、以下のJSON形式で結果を返してください。JSONのみを出力してください。

## 分析データ:
- 現在月: ${analysisData.currentMonth}
- 総取引数: ${analysisData.totalTransactions}件
- 今月の収入: ${analysisData.currentMonthIncome}円
- 今月の支出: ${analysisData.currentMonthExpense}円
- カテゴリ別支出内訳: ${JSON.stringify(analysisData.categoryBreakdown)}
- 月次推移データ: ${Object.keys(analysisData.monthlyData).slice(-6).map(month => `${month}: 収入${analysisData.monthlyData[month].income}円, 支出${analysisData.monthlyData[month].expense}円`).join('\n')}

## 返すJSON形式:
{
  "overview": { "title": "家計状況の総合評価", "summary": "現在の家計状況を具体的に2-3行で評価", "score": 70, "trend": "stable" },
  "predictions": {
    "nextMonth": { "income": ${analysisData.currentMonthIncome || 0}, "expense": ${analysisData.currentMonthExpense || 0}, "confidence": "medium" },
    "threeMonth": { "totalSavings": ${(analysisData.currentMonthIncome - analysisData.currentMonthExpense) * 3 || 0}, "riskFactors": ["具体的なリスク要因1"] }
  },
  "insights": [ { "type": "pattern", "title": "支出パターンの分析", "description": "データに基づく具体的な分析内容", "impact": "medium" } ],
  "recommendations": [ { "category": "saving", "action": "データに基づく具体的な改善提案", "expectedImpact": "期待される具体的な効果", "priority": "high" } ],
  "chartData": {
    "monthlyTrend": [${Object.keys(analysisData.monthlyData).slice(-6).map(month => `{"month": "${month.slice(5)}", "income": ${analysisData.monthlyData[month].income}, "expense": ${analysisData.monthlyData[month].expense}, "balance": ${analysisData.monthlyData[month].income - analysisData.monthlyData[month].expense}}`).join(',\n')}],
    "categoryBreakdown": [${analysisData.categoryBreakdown.map(cat => `{"category": "${cat.category}", "amount": ${cat.amount}, "percentage": ${cat.percentage}}`).join(',\n')}]
  }
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, response_mime_type: "application/json" },
        })
      });

      if (!response.ok) throw new Error(`AI分析リクエストが失敗しました: ${response.status}`);

      const data = await response.json();
      const responseText = data.candidates[0].content.parts[0].text;
      let analysisDataResult = JSON.parse(responseText);
      
      const analysisWithTimestamp = { ...analysisDataResult, timestamp: new Date().toISOString(), id: Date.now() };
      setAnalysisResult(analysisWithTimestamp);
      saveAnalysisHistory(analysisWithTimestamp);
      showNotification('AI分析が完了しました！', 'success');

    } catch (error) {
      console.error('AI分析エラー:', error);
      showNotification('AI分析中にエラーが発生しました。', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadPreviousAnalysis = (analysis) => {
    setAnalysisResult(analysis);
    setChatHistory([]);
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim() || isChatting) return;

    const newUserMessage = { role: 'user', content: userMessage };
    setChatHistory(prev => [...prev, newUserMessage]);
    setUserMessage('');
    setIsChatting(true);

    try {
      const prompt = `あなたは優秀なファイナンシャルアドバイザーです。
以下の家計データと、あなたが行った直前の分析結果、そしてこれまでの会話履歴を元に、ユーザーの新しい質問に簡潔に答えてください。

【元の家計データ概要】
- 今月の収入: ${formatAmount(monthlyIncome)}
- 今月の支出: ${formatAmount(monthlyExpense)}
- 総取引数: ${transactions.length}件

【直前の分析結果の要約】
${analysisResult.overview.summary}

【これまでの会話履歴】
${chatHistory.map(msg => `${msg.role === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`).join('\n')}

【ユーザーの新しい質問】
${userMessage}
`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5 }
        })
      });

      if (!response.ok) throw new Error('AIチャットの応答取得に失敗しました。');

      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;
      setChatHistory(prev => [...prev, { role: 'ai', content: aiResponse }]);

    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { role: 'ai', content: '申し訳ありません、エラーが発生しました。' }]);
    } finally {
      setIsChatting(false);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="pb-20">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 text-center`}>
          <Brain size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>AI分析</h2>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>分析するデータがありません。<br />取引を追加してからAI分析をお試しください。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-4`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-full"><Brain size={24} className="text-purple-600" /></div>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>AI家計分析</h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Google Gemini AIによる詳細な家計分析とアドバイス</p>
            </div>
          </div>
        </div>
        <button onClick={runAIAnalysis} disabled={isAnalyzing} className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-lg font-semibold disabled:opacity-50">
          {isAnalyzing ? (<><Loader size={20} className="animate-spin" /> Gemini AIで分析中...</>) : (<><Brain size={20} /> Gemini AI分析を実行</>)}
        </button>
      </div>

      {analysisHistory.length > 0 && (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 mb-4`}>
          <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>過去の分析結果</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {analysisHistory.map((analysis) => (
              <button key={analysis.id} onClick={() => loadPreviousAnalysis(analysis)} className={`w-full text-left p-3 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>家計分析レポート</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(analysis.timestamp).toLocaleDateString('ja-JP')}</span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>スコア: {analysis.overview?.score}/100</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="space-y-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
            <button onClick={() => toggleSection('overview')} className="w-full flex items-center justify-between mb-3">
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>📊 {analysisResult.overview?.title || '総合評価'}</h3>
              {expandedSections.overview ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {expandedSections.overview && (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className={`text-3xl font-bold ${analysisResult.overview?.score >= 80 ? 'text-green-600' : analysisResult.overview?.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{analysisResult.overview?.score}/100</div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${analysisResult.overview?.trend === 'improving' ? 'bg-green-100 text-green-800' : analysisResult.overview?.trend === 'stable' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                    {analysisResult.overview?.trend === 'improving' ? '改善傾向' : analysisResult.overview?.trend === 'stable' ? '安定' : '悪化傾向'}
                  </div>
                </div>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{analysisResult.overview?.summary}</p>
              </div>
            )}
          </div>

          {analysisResult.predictions && (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
              <button onClick={() => toggleSection('predictions')} className="w-full flex items-center justify-between mb-3">
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>🔮 予測分析</h3>
                {expandedSections.predictions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedSections.predictions && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>来月予測収入</p>
                      <p className="text-lg font-bold text-green-600">{formatAmount(analysisResult.predictions.nextMonth?.income || 0)}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>来月予測支出</p>
                      <p className="text-lg font-bold text-red-600">{formatAmount(analysisResult.predictions.nextMonth?.expense || 0)}</p>
                    </div>
                  </div>
                  {analysisResult.predictions.threeMonth && (
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>3ヶ月後予測貯蓄</p>
                      <p className="text-xl font-bold text-blue-600">{formatAmount(analysisResult.predictions.threeMonth.totalSavings || 0)}</p>
                      {analysisResult.predictions.threeMonth.riskFactors && (
                        <div className="mt-2">
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>リスク要因:</p>
                          <ul className="text-sm text-red-600">{analysisResult.predictions.threeMonth.riskFactors.map((risk, index) => (<li key={index}>• {risk}</li>))}</ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {analysisResult.chartData && (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
              <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>📈 データ可視化</h3>
              {analysisResult.chartData.monthlyTrend && (
                <div className="mb-6">
                  <h4 className={`text-md font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>月次収支トレンド</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={analysisResult.chartData.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}月`} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value, name) => [formatAmount(value), name]} labelFormatter={(label) => `${label}月`} />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="#10b981" name="収入" strokeWidth={2} />
                      <Line type="monotone" dataKey="expense" stroke="#ef4444" name="支出" strokeWidth={2} />
                      <Line type="monotone" dataKey="balance" stroke="#3b82f6" name="収支" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              {analysisResult.chartData.categoryBreakdown && (
                <div>
                  <h4 className={`text-md font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>カテゴリ別支出内訳</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={analysisResult.chartData.categoryBreakdown} cx="50%" cy="50%" labelLine={false} label={({ category, percentage }) => `${category}\n${percentage}%`} outerRadius={80} fill="#8884d8" dataKey="amount">
                        {analysisResult.chartData.categoryBreakdown.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatAmount(value), 'カテゴリ別支出']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {analysisResult.insights && (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
              <button onClick={() => toggleSection('insights')} className="w-full flex items-center justify-between mb-3">
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>💡 分析インサイト</h3>
                {expandedSections.insights ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedSections.insights && (
                <div className="space-y-3">
                  {analysisResult.insights.map((insight, index) => (
                    <div key={index} className={`p-3 rounded-lg border-l-4 ${insight.impact === 'high' ? 'border-red-500 bg-red-50' : insight.impact === 'medium' ? 'border-yellow-500 bg-yellow-50' : 'border-blue-500 bg-blue-50'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm px-2 py-1 rounded ${insight.type === 'pattern' ? 'bg-blue-100 text-blue-800' : insight.type === 'anomaly' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {insight.type === 'pattern' ? 'パターン' : insight.type === 'anomaly' ? '異常値' : 'トレンド'}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded ${insight.impact === 'high' ? 'bg-red-100 text-red-800' : insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                          {insight.impact === 'high' ? '高影響' : insight.impact === 'medium' ? '中影響' : '低影響'}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {analysisResult.recommendations && (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
              <button onClick={() => toggleSection('recommendations')} className="w-full flex items-center justify-between mb-3">
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>🎯 推奨アクション</h3>
                {expandedSections.recommendations ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedSections.recommendations && (
                <div className="space-y-3">
                  {analysisResult.recommendations.map((rec, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${rec.priority === 'high' ? 'border-red-300 bg-red-50' : rec.priority === 'medium' ? 'border-yellow-300 bg-yellow-50' : 'border-green-300 bg-green-50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm px-2 py-1 rounded ${rec.category === 'saving' ? 'bg-green-100 text-green-800' : rec.category === 'spending' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                          {rec.category === 'saving' ? '貯蓄' : rec.category === 'spending' ? '支出' : '収入'}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded ${rec.priority === 'high' ? 'bg-red-100 text-red-800' : rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                          {rec.priority === 'high' ? '高優先度' : rec.priority === 'medium' ? '中優先度' : '低優先度'}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1">{rec.action}</h4>
                      <p className="text-sm text-gray-600">{rec.expectedImpact}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className={`mt-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
            <div className="p-4 border-b">
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                💬 AIに質問する
              </h3>
            </div>
            <div
              ref={chatContainerRef}
              className="p-4 h-64 overflow-y-auto space-y-4"
            >
              {chatHistory.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isChatting && (
                <div className="flex justify-start">
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                    <Loader size={16} className="animate-spin" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t flex gap-2">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="分析結果について質問..."
                className={`flex-1 px-3 py-2 border rounded-md ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                disabled={isChatting}
              />
              <button
                onClick={handleSendMessage}
                disabled={isChatting || !userMessage.trim()}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                送信
              </button>
            </div>
          </div>

          <div className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            分析実行日時: {new Date(analysisResult.timestamp).toLocaleString('ja-JP')}
          </div>
        </div>
      )}
    </div>
  );
};

const StatsView = ({ darkMode, formatAmount, monthlyIncome, monthlyExpense, categories, monthlyTransactions, categoryIcons }) => (
    <div className="pb-20 space-y-4">
      {/* 収支バランス */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          収支バランス
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>今月の収入</span>
            <span className="font-bold text-green-600">{formatAmount(monthlyIncome)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>今月の支出</span>
            <span className="font-bold text-red-600">{formatAmount(monthlyExpense)}</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>収支</span>
              <span className={`font-bold text-lg ${
                (monthlyIncome - monthlyExpense) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatAmount(monthlyIncome - monthlyExpense)}
              </span>
            </div>
          </div>
        </div>
      </div>
  
      {/* カテゴリー別支出 */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          カテゴリー別支出
        </h2>
        <div className="space-y-3">
          {categories.expense.map(cat => {
            const categoryExpense = monthlyTransactions
              .filter(t => t.type === 'expense' && t.category === cat)
              .reduce((sum, t) => sum + t.amount, 0);
  
            if (categoryExpense === 0) return null;
  
            const IconComponent = categoryIcons[cat] || Coffee;
            return (
              <div key={cat} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconComponent size={16} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{cat}</span>
                </div>
                <span className="font-bold text-red-600">{formatAmount(categoryExpense)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
  
  const SettingsView = ({
    darkMode, setDarkMode, autoSave, setAutoSave, setShowCategoryManager,
    lastSaved, saveData, exportData, importData, geminiApiKey, saveApiKey, showNotification,
    transactions, onGenerateBudget, isPlanningBudget // 新しいpropsを受け取る
  }) => {
    const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
    const [showApiKey, setShowApiKey] = useState(false);

    // 貯金目標用のState
    const [goalName, setGoalName] = useState('');
    const [goalAmount, setGoalAmount] = useState('');
    const [goalDeadline, setGoalDeadline] = useState(6);
    const [goalAnalysisResult, setGoalAnalysisResult] = useState(null);
    const [isAnalyzingGoal, setIsAnalyzingGoal] = useState(false);

    const handleSaveApiKey = () => {
      if (apiKeyInput.trim()) {
        saveApiKey(apiKeyInput.trim());
      } else {
        showNotification('API KEYを入力してください', 'warning');
      }
    };

    const handleAnalyzeGoal = async () => {
      if (!goalName.trim() || !goalAmount.trim()) {
        showNotification('目標と金額を入力してください', 'warning');
        return;
      }
      if (!geminiApiKey) {
        showNotification('この機能にはGemini API KEYが必要です。', 'warning');
        return;
      }

      setIsAnalyzingGoal(true);
      setGoalAnalysisResult(null);

      try {
        // 過去3ヶ月の平均収支を計算
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        const recentTransactions = transactions.filter(t => new Date(t.date) >= threeMonthsAgo);
        const monthlyData = {};

        recentTransactions.forEach(t => {
          const month = t.date.slice(0, 7);
          if (!monthlyData[month]) {
            monthlyData[month] = { income: 0, expense: 0 };
          }
          monthlyData[month][t.type] += t.amount;
        });

        const months = Object.values(monthlyData);
        const avgIncome = months.reduce((sum, m) => sum + m.income, 0) / (months.length || 1);
        const avgExpense = months.reduce((sum, m) => sum + m.expense, 0) / (months.length || 1);
        const avgSavings = avgIncome - avgExpense;

        const prompt = `ユーザーは「${goalName}」のために「${goalAmount}円」を「${goalDeadline}ヶ月」で貯めたいと考えています。
  ユーザーの平均的な月間貯金可能額は「${Math.round(avgSavings)}円」です。
  この目標が達成可能か診断し、具体的な月々の貯金額と、達成に向けた励ましやアドバイスを日本語で生成してください。`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          })
        });

        if (!response.ok) throw new Error('目標分析に失敗しました。');
        
        const data = await response.json();
        const resultText = data.candidates[0].content.parts[0].text;
        setGoalAnalysisResult(resultText);

      } catch (error) {
        console.error(error);
        showNotification('目標分析中にエラーが発生しました。', 'error');
      } finally {
        setIsAnalyzingGoal(false);
      }
    };
  
    return (
      <div className="pb-20 space-y-4">
        {/* AI設定 */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            🤖 AI分析設定
          </h2>
  
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Gemini API KEY
              </label>
              <div className="flex gap-2">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className={`flex-1 px-3 py-2 border rounded-md ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className={`px-3 py-2 rounded-md ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                onClick={handleSaveApiKey}
                className="mt-2 w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
              >
                API KEYを保存
              </button>
              <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Google AI StudioでGemini API KEYを取得してください<br />
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  https://aistudio.google.com/app/apikey
                </a>
              </p>
              {geminiApiKey && (
                <div className="mt-2 flex items-center gap-2">
                  <Check size={16} className="text-green-600" />
                  <span className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    API KEY設定済み
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 基本設定 */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            基本設定
          </h2>

          <div className="space-y-4">
            {/* ダークモード */}
            <div className="flex items-center justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>ダークモード</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                  darkMode
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                {darkMode ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* 自動保存 */}
            <div className="flex items-center justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>自動保存</span>
              <button
                onClick={() => setAutoSave(!autoSave)}
                className={`px-3 py-2 rounded-md ${
                  autoSave
                    ? 'bg-green-600 text-white'
                    : darkMode
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-200 text-gray-700'
                }`}
              >
                {autoSave ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* カテゴリ管理 */}
            <div className="flex items-center justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>カテゴリ管理</span>
              <button
                onClick={() => setShowCategoryManager(true)}
                className="bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                管理
              </button>
            </div>

            {/* 最終保存日時 */}
            {lastSaved && (
              <div className="flex items-center justify-between">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>最終保存</span>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {lastSaved.toLocaleString('ja-JP')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* AIツールセクション */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            🤖 AIツール
          </h2>
          <div className="space-y-4">
            {/* AI予算プランナー */}
            <button
              onClick={onGenerateBudget}
              disabled={isPlanningBudget}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPlanningBudget ? <Loader size={20} className="animate-spin" /> : <PiggyBank size={20} />}
              {isPlanningBudget ? '予算案を作成中...' : 'AI予算プラン提案'}
            </button>

            {/* AI貯金目標サポーター */}
            <div className="pt-4 border-t dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Target className="text-green-500" size={20} />
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>AI貯金目標サポーター</h3>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="目標 (例: 沖縄旅行)"
                  className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    placeholder="目標金額 (円)"
                    className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <input
                    type="number"
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    placeholder="期限 (ヶ月)"
                    className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <button
                  onClick={handleAnalyzeGoal}
                  disabled={isAnalyzingGoal}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isAnalyzingGoal ? <Loader size={20} className="animate-spin" /> : <Brain size={20} />}
                  {isAnalyzingGoal ? '分析中...' : '目標をAIに相談'}
                </button>
                {goalAnalysisResult && (
                  <div className={`p-3 mt-3 rounded-lg whitespace-pre-wrap ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                    {goalAnalysisResult}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* データ管理 */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            データ管理
          </h2>

          <div className="space-y-3">
            <button
              onClick={saveData}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Database size={20} />
              手動保存
            </button>

            <button
              onClick={exportData}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={20} />
              データエクスポート
            </button>

            <label className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <Upload size={20} />
              データインポート
              <input type="file" accept=".json" onChange={importData} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    );
  };