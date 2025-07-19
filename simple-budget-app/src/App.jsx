import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, MinusCircle, Wallet, TrendingUp, TrendingDown, Calendar, Download, Upload, Settings, BarChart3, Filter, Search, RefreshCw, Database, Eye, EyeOff, Menu, X, Check, Info, AlertCircle, Trash2, Edit3, Home, Car, Utensils, ShoppingCart, Heart, Briefcase, GraduationCap, Plane, Coffee, Gift, Music, Smartphone, Gamepad2, Sun, Moon, Brain, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Colors for charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347'];

const TransactionDetailModal = ({
  darkMode, transaction, onClose, onEdit, formatAmount, formatDate, categoryIcons
}) => {
  if (!transaction) return null;

  const IconComponent = categoryIcons[transaction.category] || Coffee;
  const details = transaction.details || transaction.description || '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              取引詳細
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* 金額とタイプ */}
            <div className="text-center">
              <div className={`inline-flex items-center gap-3 p-4 rounded-lg ${
                transaction.type === 'income'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                <IconComponent size={24} />
                <span className="text-2xl font-bold">
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatAmount(transaction.amount)}
                </span>
              </div>
            </div>

            {/* 基本情報 */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>カテゴリー</span>
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{transaction.category}</span>
              </div>

              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>日付</span>
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {new Date(transaction.date).toLocaleDateString('ja-JP')}
                </span>
              </div>

              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>タイプ</span>
                <span className={`font-medium ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '収入' : '支出'}
                </span>
              </div>
            </div>

            {/* 詳細 */}
            {details && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  詳細
                </label>
                <div className={`p-3 rounded-lg whitespace-pre-wrap ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'
                }`}>
                  {details}
                </div>
              </div>
            )}

            {/* ボタン */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => onEdit(transaction)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 size={16} />
                編集
              </button>
              <button
                onClick={onClose}
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditTransactionModal = ({
  darkMode, transaction, amount, setAmount, category, setCategory, details, setDetails,
  type, setType, date, setDate, categories, onUpdate, onCancel, setShowCategoryManager
}) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden`}>
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              取引を編集
            </h2>
            <button
              onClick={onCancel}
              className={`p-2 rounded-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* 取引タイプ */}
            <div className="flex gap-4">
              <label className="flex items-center flex-1">
                <input
                  type="radio"
                  value="income"
                  checked={type === 'income'}
                  onChange={(e) => {
                    setType(e.target.value);
                    setCategory('');
                  }}
                  className="mr-2"
                />
                <span className="text-green-600 font-semibold">収入</span>
              </label>
              <label className="flex items-center flex-1">
                <input
                  type="radio"
                  value="expense"
                  checked={type === 'expense'}
                  onChange={(e) => {
                    setType(e.target.value);
                    setCategory('');
                  }}
                  className="mr-2"
                />
                <span className="text-red-600 font-semibold">支出</span>
              </label>
            </div>

            {/* 金額 */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                金額
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>

            {/* カテゴリー */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                カテゴリー
              </label>
              <select
                value={category}
                onChange={(e) => {
                  if (e.target.value === '__ADD_NEW__') {
                    setShowCategoryManager(true);
                  } else {
                    setCategory(e.target.value);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="">カテゴリーを選択</option>
                {categories[type].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="__ADD_NEW__" className="text-blue-600 font-medium">
                  ➕ 新しいカテゴリを追加
                </option>
              </select>
            </div>

            {/* 詳細 */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                詳細
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md resize-none ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>

            {/* 日付 */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                日付
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>

            {/* ボタン */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onUpdate}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check size={16} />
                更新
              </button>
              <button
                onClick={onCancel}
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                キャンセル
              </button>
            </div>
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
    setShowCategoryManager, categories, details, setDetails, date, setDate, addTransaction
  }) => (
    <div className="pb-20">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          取引を追加
        </h2>
  
        <div className="space-y-4">
          {/* 取引タイプ */}
          <div className="flex gap-4">
            <label className="flex items-center flex-1">
              <input
                type="radio"
                value="income"
                checked={type === 'income'}
                onChange={(e) => {
                  setType(e.target.value);
                  setCategory('');
                }}
                className="mr-2"
              />
              <span className="text-green-600 font-semibold">収入</span>
            </label>
            <label className="flex items-center flex-1">
              <input
                type="radio"
                value="expense"
                checked={type === 'expense'}
                onChange={(e) => {
                  setType(e.target.value);
                  setCategory('');
                }}
                className="mr-2"
              />
              <span className="text-red-600 font-semibold">支出</span>
            </label>
          </div>
  
          {/* 金額 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              金額
            </label>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="金額を入力"
              className={`w-full px-3 py-3 border rounded-md text-lg ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </div>
  
          {/* カテゴリー */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              カテゴリー
            </label>
            <select
              value={category}
              onChange={(e) => {
                if (e.target.value === '__ADD_NEW__') {
                  setShowCategoryManager(true);
                } else {
                  setCategory(e.target.value);
                }
              }}
              className={`w-full px-3 py-3 border rounded-md ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            >
              <option value="">カテゴリーを選択</option>
              {categories[type].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="__ADD_NEW__" className="text-blue-600 font-medium">
                ➕ 新しいカテゴリを追加
              </option>
            </select>
          </div>
  
          {/* 詳細 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              詳細
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="詳細を入力
例：
・商品名
・購入場所
・メモ"
              rows={4}
              className={`w-full px-3 py-3 border rounded-md resize-none ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              買ったものの詳細、場所、メモなどを自由に記入できます
            </p>
          </div>
  
          {/* 日付 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              日付
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-3 py-3 border rounded-md ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>
  
          {/* 追加ボタン */}
          <button
            onClick={addTransaction}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-lg font-semibold"
          >
            <Check size={20} />
            取引を追加
          </button>
        </div>
      </div>
    </div>
  );
  
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
  
    // 分析履歴を読み込み
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
  
    // 分析履歴を保存
    const saveAnalysisHistory = (newAnalysis) => {
      const updatedHistory = [newAnalysis, ...analysisHistory.slice(0, 9)]; // 最新10件を保持
      setAnalysisHistory(updatedHistory);
      localStorage.setItem('ai_analysis_history', JSON.stringify(updatedHistory));
    };
  
    const toggleSection = (section) => {
      setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    };
  
    // データを分析用に準備
    const prepareAnalysisData = () => {
      if (transactions.length === 0) return null;
  
      const now = new Date();
      const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1).toISOString().slice(0, 7);
      const last3Months = new Date(now.getFullYear(), now.getMonth() - 2).toISOString().slice(0, 7);
  
      // 月別データ集計
      const monthlyData = {};
      // カテゴリ別データ集計
      const categoryData = {};
  
      // 全期間のカテゴリ別支出を計算
      const categoryExpenseData = {};
      let totalExpense = 0;
  
      transactions.forEach(t => {
        const month = t.date.slice(0, 7);
  
        // 月別データ
        if (!monthlyData[month]) {
          monthlyData[month] = { income: 0, expense: 0, count: 0 };
        }
        monthlyData[month][t.type] += t.amount;
        monthlyData[month].count += 1;
  
        // カテゴリ別データ（全期間）
        if (!categoryData[t.category]) {
          categoryData[t.category] = {
            income: 0,
            expense: 0,
            count: 0,
            type: t.type === 'income' ? 'income' : 'expense'
          };
        }
        categoryData[t.category][t.type] += t.amount;
        categoryData[t.category].count += 1;
  
        // 支出カテゴリ別集計（グラフ用）
        if (t.type === 'expense') {
          if (!categoryExpenseData[t.category]) {
            categoryExpenseData[t.category] = 0;
          }
          categoryExpenseData[t.category] += t.amount;
          totalExpense += t.amount;
        }
      });
  
      // 現在月のデータ
      const currentMonthData = monthlyData[currentMonth] || { income: 0, expense: 0, count: 0 };
  
      // カテゴリー別支出の割合計算
      const categoryBreakdown = Object.keys(categoryExpenseData)
        .map(category => ({
          category,
          amount: categoryExpenseData[category],
          percentage: totalExpense > 0 ? Math.round((categoryExpenseData[category] / totalExpense) * 100) : 0
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 8); // 上位8カテゴリ
  
      console.log('分析データ準備完了:', {
        currentMonth,
        currentMonthData,
        categoryBreakdown,
        totalExpense,
        monthlyDataKeys: Object.keys(monthlyData)
      });
  
      return {
        totalTransactions: transactions.length,
        currentMonth,
        lastMonth,
        last3Months,
        monthlyData,
        categoryData,
        categoryExpenseData,
        categoryBreakdown,
        currentMonthIncome: currentMonthData.income,
        currentMonthExpense: currentMonthData.expense,
        totalExpense,
        recentTransactions: transactions.slice(0, 20) // 最新20件
      };
    };
  
    // AI分析実行
    const runAIAnalysis = async () => {
      console.log('=== AI分析開始 ===');
      console.log('取引データ数:', transactions.length);
      console.log('今月収入:', monthlyIncome);
      console.log('今月支出:', monthlyExpense);
  
      // API KEYチェック
      if (!geminiApiKey.trim()) {
        showNotification('Gemini API KEYが設定されていません。設定画面でAPI KEYを入力してください。', 'warning');
        return;
      }
  
      const analysisData = prepareAnalysisData();
      if (!analysisData) {
        showNotification('分析するデータがありません。取引を追加してから再実行してください。', 'warning');
        return;
      }
  
      console.log('=== 分析データ詳細 ===');
      console.log('現在月:', analysisData.currentMonth);
      console.log('今月収入:', analysisData.currentMonthIncome);
      console.log('今月支出:', analysisData.currentMonthExpense);
      console.log('カテゴリー別支出内訳:', analysisData.categoryBreakdown);
      console.log('月次データ:', analysisData.monthlyData);
  
      setIsAnalyzing(true);
  
      try {
        // Gemini API用のプロンプト
        const prompt = `
  家計簿データを分析して、以下のJSON形式で結果を返してください。JSONのみを出力してください。
  
  ## 分析データ:
  - 現在月: ${analysisData.currentMonth}
  - 総取引数: ${analysisData.totalTransactions}件
  - 今月の収入: ${analysisData.currentMonthIncome}円
  - 今月の支出: ${analysisData.currentMonthExpense}円
  - カテゴリ別支出内訳: ${JSON.stringify(analysisData.categoryBreakdown)}
  
  ## 月次推移データ:
  ${Object.keys(analysisData.monthlyData).slice(-6).map(month =>
    `${month}: 収入${analysisData.monthlyData[month].income}円, 支出${analysisData.monthlyData[month].expense}円`
  ).join('\n')}
  
  ## 返すJSON形式:
  {
    "overview": {
      "title": "家計状況の総合評価",
      "summary": "現在の家計状況を具体的に2-3行で評価",
      "score": 70,
      "trend": "stable"
    },
    "predictions": {
      "nextMonth": {
        "income": ${analysisData.currentMonthIncome || 200000},
        "expense": ${analysisData.currentMonthExpense || 180000},
        "confidence": "medium"
      },
      "threeMonth": {
        "totalSavings": ${(analysisData.currentMonthIncome - analysisData.currentMonthExpense) * 3 || 60000},
        "riskFactors": ["具体的なリスク要因1", "具体的なリスク要因2"]
      }
    },
    "insights": [
      {
        "type": "pattern",
        "title": "支出パターンの分析",
        "description": "データに基づく具体的な分析内容",
        "impact": "medium"
      }
    ],
    "recommendations": [
      {
        "category": "saving",
        "action": "データに基づく具体的な改善提案",
        "expectedImpact": "期待される具体的な効果",
        "priority": "high"
      }
    ],
    "chartData": {
      "monthlyTrend": [
  ${Object.keys(analysisData.monthlyData).slice(-6).map(month =>
    `      {"month": "${month.slice(5)}", "income": ${analysisData.monthlyData[month].income}, "expense": ${analysisData.monthlyData[month].expense}, "balance": ${analysisData.monthlyData[month].income - analysisData.monthlyData[month].expense}}`
  ).join(',\n')}
      ],
      "categoryBreakdown": [
  ${analysisData.categoryBreakdown.map(cat =>
    `      {"category": "${cat.category}", "amount": ${cat.amount}, "percentage": ${cat.percentage}}`
  ).join(',\n')}
      ]
    }
  }
  
  JSONのみを返してください:`;
  
        console.log('Gemini 2.0 Flash APIリクエスト送信中...');
  
        // Gemini API呼び出し
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 4096,
              candidateCount: 1
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_NONE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_NONE"
              }
            ]
          })
        });
  
        console.log('APIレスポンス:', response.status);
  
        if (!response.ok) {
          const errorText = await response.text();
          console.error('APIエラー詳細:', errorText);
  
          if (response.status === 400) {
            const errorData = await response.json();
            console.error('API 400エラー詳細:', errorData);
            if (errorData.error && errorData.error.message.includes('API_KEY_INVALID')) {
              throw new Error('API KEYが無効です。設定画面で正しいGemini API KEYを入力してください。');
            } else {
              throw new Error(`リクエストエラー: ${errorData.error?.message || 'API KEYまたはリクエスト形式を確認してください'}`);
            }
          } else if (response.status === 403) {
            throw new Error('API KEYの権限が不足しています。Gemini APIが有効になっているか確認してください。');
          } else {
            throw new Error(`AI分析リクエストが失敗しました: ${response.status}`);
          }
        }
  
        const data = await response.json();
        console.log('APIレスポンスデータ:', data);
  
        // Gemini APIのレスポンス構造に対応
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
          console.error('予期しないAPIレスポンス構造:', data);
          throw new Error('APIレスポンスの形式が予期されたものと異なります');
        }
  
        let responseText = data.candidates[0].content.parts[0].text;
        console.log('レスポンステキスト:', responseText);
  
        // JSONの抽出とパース
        responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  
        let analysisDataResult;
        try {
          analysisDataResult = JSON.parse(responseText);
          console.log('パース成功:', analysisDataResult);
        } catch (parseError) {
          console.error('JSONパースエラー:', parseError);
          console.log('パース対象テキスト:', responseText);
  
          // フォールバック用のダミーデータ
          analysisDataResult = {
            overview: {
              title: "家計状況の分析結果",
              summary: `${analysisData.totalTransactions}件の取引データを分析しました。今月の収支は${formatAmount(analysisData.currentMonthIncome - analysisData.currentMonthExpense)}です。`,
              score: 70,
              trend: "stable"
            },
            predictions: {
              nextMonth: {
                income: analysisData.currentMonthIncome || 200000,
                expense: analysisData.currentMonthExpense || 180000,
                confidence: "medium"
              },
              threeMonth: {
                totalSavings: (analysisData.currentMonthIncome - analysisData.currentMonthExpense) * 3 || 60000,
                riskFactors: ["支出の増加傾向", "季節的な変動"]
              }
            },
            insights: [
              {
                type: "pattern",
                title: "支出パターンの安定性",
                description: `今月の支出は${formatAmount(analysisData.currentMonthExpense)}で、継続的な管理ができています。`,
                impact: "medium"
              }
            ],
            recommendations: [
              {
                category: "saving",
                action: "月間予算の設定と追跡",
                expectedImpact: "支出管理の改善により月1万円の節約が期待できます",
                priority: "high"
              },
              {
                category: "spending",
                action: "最大支出カテゴリの見直し",
                expectedImpact: `${analysisData.categoryBreakdown[0]?.category || '主要カテゴリ'}の最適化`,
                priority: "medium"
              }
            ],
            chartData: {
              monthlyTrend: Object.keys(analysisData.monthlyData).slice(-6).map(month => ({
                month: month.slice(5), // MM形式
                income: analysisData.monthlyData[month].income,
                expense: analysisData.monthlyData[month].expense,
                balance: analysisData.monthlyData[month].income - analysisData.monthlyData[month].expense
              })),
              categoryBreakdown: analysisData.categoryBreakdown.slice(0, 6)
            }
          };
        }
  
        // タイムスタンプを追加
        const analysisWithTimestamp = {
          ...analysisDataResult,
          timestamp: new Date().toISOString(),
          id: Date.now()
        };
  
        setAnalysisResult(analysisWithTimestamp);
        saveAnalysisHistory(analysisWithTimestamp);
        showNotification('AI分析が完了しました！', 'success');
  
        console.log('分析完了:', analysisWithTimestamp);
  
      } catch (error) {
        console.error('AI分析エラー:', error);
  
        // API KEYエラーの場合は特別な処理
        if (error.message.includes('API KEY')) {
          alert(error.message);
          return;
        }
  
        // エラー時でも基本的な分析結果を表示
        const fallbackAnalysis = {
          overview: {
            title: "基本分析結果",
            summary: `${transactions.length}件の取引データから基本的な分析を行いました。今月の収支：${formatAmount(monthlyIncome - monthlyExpense)}`,
            score: 65,
            trend: "stable"
          },
          predictions: {
            nextMonth: {
              income: monthlyIncome || 200000,
              expense: monthlyExpense || 180000,
              confidence: "low"
            },
            threeMonth: {
              totalSavings: (monthlyIncome - monthlyExpense) * 3 || 60000,
              riskFactors: ["データ不足による予測精度の低下", "APIアクセスの問題"]
            }
          },
          insights: [
            {
              type: "trend",
              title: "基本的な収支状況",
              description: `今月の収入${formatAmount(monthlyIncome)}、支出${formatAmount(monthlyExpense)}を記録しています。`,
              impact: "medium"
            }
          ],
          recommendations: [
            {
              category: "saving",
              action: "定期的な家計の記録と分析",
              expectedImpact: "分析精度の向上と家計管理の改善",
              priority: "high"
            }
          ],
          chartData: {
            monthlyTrend: [
              {
                month: new Date().toISOString().slice(5, 7), // 今月のMM
                income: monthlyIncome,
                expense: monthlyExpense,
                balance: monthlyIncome - monthlyExpense
              }
            ],
            categoryBreakdown: categories.expense.slice(0, 4).map((category, index) => {
              // 実際のカテゴリ別支出を計算
              const categoryAmount = transactions
                .filter(t => t.type === 'expense' && t.category === category && t.date.startsWith(new Date().toISOString().slice(0, 7)))
                .reduce((sum, t) => sum + t.amount, 0);
              return {
                category,
                amount: categoryAmount || (30000 + index * 10000),
                percentage: monthlyExpense > 0 ? Math.round((categoryAmount / monthlyExpense) * 100) : (20 + index * 5)
              };
            })
          },
          timestamp: new Date().toISOString(),
          id: Date.now()
        };
  
        setAnalysisResult(fallbackAnalysis);
        saveAnalysisHistory(fallbackAnalysis);
  
        showNotification('基本分析を表示しました。API接続の問題により詳細分析は利用できませんでした。', 'warning');
      } finally {
        setIsAnalyzing(false);
      }
    };
  
    // 過去の分析結果を表示
    const loadPreviousAnalysis = (analysis) => {
      setAnalysisResult(analysis);
    };
  
    if (transactions.length === 0) {
      return (
        <div className="pb-20">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 text-center`}>
            <Brain size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              AI分析
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              分析するデータがありません。<br />
              取引を追加してからAI分析をお試しください。
            </p>
          </div>
        </div>
      );
    }
  
    return (
      <div className="pb-20">
        {/* AI分析ヘッダー */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-4`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Brain size={24} className="text-purple-600" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  AI家計分析
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Google Gemini AIによる詳細な家計分析とアドバイス
                </p>
              </div>
            </div>
          </div>
  
          <button
            onClick={runAIAnalysis}
            disabled={isAnalyzing}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-lg font-semibold disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader size={20} className="animate-spin" />
                Gemini AIで分析中...
              </>
            ) : (
              <>
                <Brain size={20} />
                Gemini AI分析を実行
              </>
            )}
          </button>
        </div>
  
        {/* 分析履歴 */}
        {analysisHistory.length > 0 && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 mb-4`}>
            <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              過去の分析結果
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {analysisHistory.map((analysis) => (
                <button
                  key={analysis.id}
                  onClick={() => loadPreviousAnalysis(analysis)}
                  className={`w-full text-left p-3 rounded-lg ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  } transition-colors`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      家計分析レポート
                    </span>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(analysis.timestamp).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                    スコア: {analysis.overview?.score}/100
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
  
        {/* 分析結果表示 */}
        {analysisResult && (
          <div className="space-y-4">
            {/* 総合評価 */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
              <button
                onClick={() => toggleSection('overview')}
                className="w-full flex items-center justify-between mb-3"
              >
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  📊 {analysisResult.overview?.title || '総合評価'}
                </h3>
                {expandedSections.overview ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
  
              {expandedSections.overview && (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className={`text-3xl font-bold ${
                      analysisResult.overview?.score >= 80 ? 'text-green-600' :
                      analysisResult.overview?.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {analysisResult.overview?.score}/100
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      analysisResult.overview?.trend === 'improving' ? 'bg-green-100 text-green-800' :
                      analysisResult.overview?.trend === 'stable' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {analysisResult.overview?.trend === 'improving' ? '改善傾向' :
                       analysisResult.overview?.trend === 'stable' ? '安定' : '悪化傾向'}
                    </div>
                  </div>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {analysisResult.overview?.summary}
                  </p>
                </div>
              )}
            </div>
  
            {/* 予測分析 */}
            {analysisResult.predictions && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                <button
                  onClick={() => toggleSection('predictions')}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    🔮 予測分析
                  </h3>
                  {expandedSections.predictions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
  
                {expandedSections.predictions && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>来月予測収入</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatAmount(analysisResult.predictions.nextMonth?.income || 0)}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>来月予測支出</p>
                        <p className="text-lg font-bold text-red-600">
                          {formatAmount(analysisResult.predictions.nextMonth?.expense || 0)}
                        </p>
                      </div>
                    </div>
  
                    {analysisResult.predictions.threeMonth && (
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>3ヶ月後予測貯蓄</p>
                        <p className="text-xl font-bold text-blue-600">
                          {formatAmount(analysisResult.predictions.threeMonth.totalSavings || 0)}
                        </p>
                        {analysisResult.predictions.threeMonth.riskFactors && (
                          <div className="mt-2">
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>リスク要因:</p>
                            <ul className="text-sm text-red-600">
                              {analysisResult.predictions.threeMonth.riskFactors.map((risk, index) => (
                                <li key={index}>• {risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
  
            {/* グラフ表示 */}
            {analysisResult.chartData && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  📈 データ可視化
                </h3>
  
                {/* 月次トレンド */}
                {analysisResult.chartData.monthlyTrend && (
                  <div className="mb-6">
                    <h4 className={`text-md font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      月次収支トレンド
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={analysisResult.chartData.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${value}月`}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value, name) => [formatAmount(value), name === 'income' ? '収入' : name === 'expense' ? '支出' : '収支']}
                          labelFormatter={(label) => `${label}月`}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="income" stroke="#10b981" name="収入" strokeWidth={2} />
                        <Line type="monotone" dataKey="expense" stroke="#ef4444" name="支出" strokeWidth={2} />
                        <Line type="monotone" dataKey="balance" stroke="#3b82f6" name="収支" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
  
                {/* カテゴリ別内訳 */}
                {analysisResult.chartData.categoryBreakdown && (
                  <div>
                    <h4 className={`text-md font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      カテゴリ別支出内訳
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={analysisResult.chartData.categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, percentage }) => `${category}\n${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="amount"
                        >
                          {analysisResult.chartData.categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [formatAmount(value), 'カテゴリ別支出']}
                          labelFormatter={(label) => `${label}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
  
            {/* インサイト */}
            {analysisResult.insights && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                <button
                  onClick={() => toggleSection('insights')}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    💡 分析インサイト
                  </h3>
                  {expandedSections.insights ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
  
                {expandedSections.insights && (
                  <div className="space-y-3">
                    {analysisResult.insights.map((insight, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        insight.impact === 'high' ? 'border-red-500 bg-red-50' :
                        insight.impact === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm px-2 py-1 rounded ${
                            insight.type === 'pattern' ? 'bg-blue-100 text-blue-800' :
                            insight.type === 'anomaly' ? 'bg-red-100 text-red-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {insight.type === 'pattern' ? 'パターン' :
                             insight.type === 'anomaly' ? '異常値' : 'トレンド'}
                          </span>
                          <span className={`text-sm px-2 py-1 rounded ${
                            insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                            insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {insight.impact === 'high' ? '高影響' :
                             insight.impact === 'medium' ? '中影響' : '低影響'}
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
  
            {/* 推奨アクション */}
            {analysisResult.recommendations && (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                <button
                  onClick={() => toggleSection('recommendations')}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    🎯 推奨アクション
                  </h3>
                  {expandedSections.recommendations ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
  
                {expandedSections.recommendations && (
                  <div className="space-y-3">
                    {analysisResult.recommendations.map((rec, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${
                        rec.priority === 'high' ? 'border-red-300 bg-red-50' :
                        rec.priority === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                        'border-green-300 bg-green-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-sm px-2 py-1 rounded ${
                            rec.category === 'saving' ? 'bg-green-100 text-green-800' :
                            rec.category === 'spending' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {rec.category === 'saving' ? '貯蓄' :
                             rec.category === 'spending' ? '支出' : '収入'}
                          </span>
                          <span className={`text-sm px-2 py-1 rounded ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {rec.priority === 'high' ? '高優先度' :
                             rec.priority === 'medium' ? '中優先度' : '低優先度'}
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
  
            {/* 分析日時 */}
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
    lastSaved, saveData, exportData, importData, geminiApiKey, saveApiKey, showNotification
  }) => {
    const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
    const [showApiKey, setShowApiKey] = useState(false);
  
    const handleSaveApiKey = () => {
      if (apiKeyInput.trim()) {
        saveApiKey(apiKeyInput.trim());
      } else {
        showNotification('API KEYを入力してください', 'warning');
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
              <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
  
  const CategoryManagerModal = ({
    darkMode, setShowCategoryManager, newCategoryType, setNewCategoryType, newCategoryName,
    setNewCategoryName, newCategoryIcon, setNewCategoryIcon, addCustomCategory, customCategories,
    deleteCustomCategory, availableIcons, customCategoryIcons
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col`}>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              カテゴリ管理
            </h2>
            <button
              onClick={() => setShowCategoryManager(false)}
              className={`p-2 rounded-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* 新規カテゴリ追加 */}
          <div className="mb-6 p-4 border rounded-lg">
            <h3 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              新規カテゴリ追加
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="income"
                    checked={newCategoryType === 'income'}
                    onChange={(e) => setNewCategoryType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-green-600 text-sm">収入</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="expense"
                    checked={newCategoryType === 'expense'}
                    onChange={(e) => setNewCategoryType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-red-600 text-sm">支出</span>
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="カテゴリ名"
                  className={`flex-1 px-3 py-2 border rounded-md ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                />
                <button
                  onClick={addCustomCategory}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  追加
                </button>
              </div>

              {/* アイコン選択 */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  アイコン
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-24 overflow-y-auto">
                  {Object.keys(availableIcons).map(iconName => {
                    const IconComponent = availableIcons[iconName];
                    return (
                      <button
                        key={iconName}
                        onClick={() => setNewCategoryIcon(iconName)}
                        className={`p-2 rounded-md border-2 transition-colors ${
                          newCategoryIcon === iconName
                            ? 'border-blue-500 bg-blue-100'
                            : darkMode
                              ? 'border-gray-600 hover:border-gray-500'
                              : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <IconComponent size={20} className={newCategoryIcon === iconName ? 'text-blue-600' : ''} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* カスタムカテゴリ一覧 */}
          <div className="space-y-4">
            {/* 収入カテゴリ */}
            {customCategories.income.length > 0 && (
              <div>
                <h4 className={`font-medium mb-2 text-green-600`}>収入カテゴリ</h4>
                <div className="space-y-2">
                  {customCategories.income.map(cat => {
                    const IconComponent = availableIcons[customCategoryIcons[cat]] || Coffee;
                    return (
                      <div key={cat} className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <div className="flex items-center gap-2">
                          <IconComponent size={16} className="text-green-600" />
                          <span className="text-sm text-green-800">{cat}</span>
                        </div>
                        <button
                          onClick={() => deleteCustomCategory(cat, 'income')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 支出カテゴリ */}
            {customCategories.expense.length > 0 && (
              <div>
                <h4 className={`font-medium mb-2 text-red-600`}>支出カテゴリ</h4>
                <div className="space-y-2">
                  {customCategories.expense.map(cat => {
                    const IconComponent = availableIcons[customCategoryIcons[cat]] || Coffee;
                    return (
                      <div key={cat} className="flex items-center justify-between p-2 bg-red-50 rounded">
                        <div className="flex items-center gap-2">
                          <IconComponent size={16} className="text-red-600" />
                          <span className="text-sm text-red-800">{cat}</span>
                        </div>
                        <button
                          onClick={() => deleteCustomCategory(cat, 'expense')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {customCategories.income.length === 0 && customCategories.expense.length === 0 && (
              <p className={`text-center py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                カスタムカテゴリがありません
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

const SimpleBudgetApp = () => {
  // 基本データ
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [details, setDetails] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // UI状態
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentView, setCurrentView] = useState('home'); // home, add, aiAnalysis, stats, settings

  // モーダル状態
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const [showEditTransaction, setShowEditTransaction] = useState(false);

  // 設定
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [geminiApiKey, setGeminiApiKey] = useState('');

  // 通知
  const [notification, setNotification] = useState(null);

  // カテゴリ管理
  const [customCategories, setCustomCategories] = useState({
    income: [],
    expense: []
  });
  const [customCategoryIcons, setCustomCategoryIcons] = useState({});
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('expense');
  const [newCategoryIcon, setNewCategoryIcon] = useState('Coffee');

  // 利用可能なアイコン
  const availableIcons = {
    'Home': Home,
    'Car': Car,
    'Utensils': Utensils,
    'ShoppingCart': ShoppingCart,
    'Heart': Heart,
    'Briefcase': Briefcase,
    'GraduationCap': GraduationCap,
    'Plane': Plane,
    'Coffee': Coffee,
    'Gift': Gift,
    'Music': Music,
    'Smartphone': Smartphone,
    'Gamepad2': Gamepad2,
    'TrendingUp': TrendingUp,
    'Wallet': Wallet,
    'Database': Database,
    'Settings': Settings,
    'BarChart3': BarChart3
  };

  // シンプルなカテゴリー設定（デフォルト）
  const defaultCategories = {
    income: ['給与', '副収入', 'ボーナス', '投資', 'その他'],
    expense: ['食費', '交通費', '光熱費', '家賃', '娯楽', '衣服', '医療', '雑費']
  };

  // 全カテゴリー（デフォルト + カスタム）
  const categories = {
    income: [...defaultCategories.income, ...customCategories.income],
    expense: [...defaultCategories.expense, ...customCategories.expense]
  };

  // カテゴリーアイコン（デフォルト + カスタム）
  const categoryIcons = {
    '食費': Utensils,
    '交通費': Car,
    '光熱費': Home,
    '家賃': Home,
    '娯楽': Gamepad2,
    '衣服': ShoppingCart,
    '医療': Heart,
    '雑費': ShoppingCart,
    '給与': Briefcase,
    '副収入': Briefcase,
    'ボーナス': Gift,
    '投資': TrendingUp,
    'その他': Coffee,
    ...Object.keys(customCategoryIcons).reduce((acc, category) => {
      acc[category] = availableIcons[customCategoryIcons[category]] || Coffee;
      return acc;
    }, {})
  };

  // --- Start of logic ---

  // 通知表示
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // データ保存
  const saveData = () => {
    try {
      const data = {
        transactions,
        customCategories,
        customCategoryIcons,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('simple_budget_data', JSON.stringify(data));
      setLastSaved(new Date());
    } catch (error) {
      showNotification('データの自動保存に失敗しました', 'error');
    }
  };
  
  // 手動保存用関数
  const manualSaveData = () => {
    try {
      const data = {
        transactions,
        customCategories,
        customCategoryIcons,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('simple_budget_data', JSON.stringify(data));
      setLastSaved(new Date());
      showNotification('データを保存しました', 'success');
    } catch (error) {
      showNotification('保存に失敗しました', 'error');
    }
  };

  // データ読み込み
  const loadData = () => {
    try {
      const savedData = localStorage.getItem('simple_budget_data');
      if (savedData) {
        const data = JSON.parse(savedData);
        setTransactions(data.transactions || []);
        setCustomCategories(data.customCategories || { income: [], expense: [] });
        setCustomCategoryIcons(data.customCategoryIcons || {});
        if (data.timestamp) {
          setLastSaved(new Date(data.timestamp));
        }
      }
    } catch (error) {
      showNotification('データの読み込みに失敗しました', 'error');
    }
  };

  // 取引詳細・編集
  const showTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetail(true);
  };

  const openEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setAmount(transaction.amount.toString());
    setCategory(transaction.category);
    setDetails(transaction.details || transaction.description || ''); // 旧データ対応
    setType(transaction.type);
    setDate(transaction.date);
    setShowEditTransaction(true);
    setShowTransactionDetail(false);
  };

  const updateTransaction = () => {
    if (!amount || !category || !details.trim()) {
      showNotification('すべての項目を入力してください', 'warning');
      return;
    }

    const updatedTransaction = {
      ...selectedTransaction,
      amount: parseFloat(amount),
      category,
      details: details.trim(),
      type,
      date,
      updatedAt: new Date().toISOString()
    };

    setTransactions(prev =>
      prev.map(t => t.id === selectedTransaction.id ? updatedTransaction : t)
    );

    setShowEditTransaction(false);
    setSelectedTransaction(null);
    setAmount('');
    setCategory('');
    setDetails('');
    showNotification('取引を更新しました', 'success');
  };

  const cancelEdit = () => {
    setShowEditTransaction(false);
    setSelectedTransaction(null);
    setAmount('');
    setCategory('');
    setDetails('');
  };

  // ダークモード適用
  useEffect(() => {
    document.body.className = darkMode ? 'dark' : '';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // API KEY保存
  const saveApiKey = (apiKey) => {
    localStorage.setItem('gemini_api_key', apiKey);
    setGeminiApiKey(apiKey);
    showNotification('API KEYを保存しました', 'success');
  };

  // 自動保存
  useEffect(() => {
    // autoSaveが有効な場合のみ実行
    if (autoSave) {
      const timeoutId = setTimeout(() => {
        saveData();
      }, 1000); // 1秒後に自動保存
      return () => clearTimeout(timeoutId);
    }
  }, [transactions, customCategories, customCategoryIcons, autoSave]); // ★ 依存配列にカテゴリの状態を追加

  // 初期データ読み込み
  useEffect(() => {
    loadData();
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedApiKey = localStorage.getItem('gemini_api_key') || '';
    setDarkMode(savedDarkMode);
    setGeminiApiKey(savedApiKey);
  }, []);

  // 取引追加
  const addTransaction = () => {
    if (!amount || !category || !details.trim()) {
      showNotification('すべての項目を入力してください', 'warning');
      return;
    }

    const newTransaction = {
      id: Date.now(),
      amount: parseFloat(amount),
      category,
      details: details.trim(),
      type,
      date,
      timestamp: new Date().toISOString()
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setAmount('');
    setCategory('');
    setDetails('');
    setCurrentView('home');

    showNotification('取引を追加しました', 'success');
  };

  // カテゴリ管理
  const addCustomCategory = () => {
    if (!newCategoryName.trim()) {
      showNotification('カテゴリ名を入力してください', 'warning');
      return;
    }

    const allCategories = [...categories[newCategoryType]];
    if (allCategories.includes(newCategoryName.trim())) {
      showNotification('そのカテゴリは既に存在します', 'warning');
      return;
    }

    setCustomCategories(prev => ({
      ...prev,
      [newCategoryType]: [...prev[newCategoryType], newCategoryName.trim()]
    }));

    setCustomCategoryIcons(prev => ({
      ...prev,
      [newCategoryName.trim()]: newCategoryIcon
    }));

    setNewCategoryName('');
    setNewCategoryIcon('Coffee');
    showNotification('カテゴリを追加しました', 'success');
  };

  const deleteCustomCategory = (categoryName, categoryType) => {
    // 確認ダイアログを表示
    if (window.confirm(`カテゴリ「${categoryName}」を削除しますか？このカテゴリの取引は「その他」に分類されます。`)) {
      // カテゴリを削除
      setCustomCategories(prev => ({
        ...prev,
        [categoryType]: prev[categoryType].filter(cat => cat !== categoryName)
      }));
  
      // 関連するアイコンを削除
      setCustomCategoryIcons(prev => {
        const newIcons = { ...prev };
        delete newIcons[categoryName];
        return newIcons;
      });
  
      // 削除されたカテゴリを使用している取引を「その他」に更新
      setTransactions(prev => 
        prev.map(t => 
          t.category === categoryName ? { ...t, category: 'その他' } : t
        )
      );
  
      showNotification('カテゴリを削除しました', 'info');
    }
  };

  // 取引削除
  const deleteTransaction = (id) => {
    if (window.confirm('この取引を削除しますか？')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      showNotification('取引を削除しました', 'info');
    }
  };

  // データエクスポート
  const exportData = () => {
    const data = {
      transactions,
      customCategories,
      customCategoryIcons,
      exportDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `budget_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    showNotification('データをエクスポートしました', 'success');
  };

  // データインポート
  const importData = (event) => {
    const file = event.target.files[0];
    if (file && window.confirm('データをインポートしますか？現在のデータは上書きされます。')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.transactions) {
            setTransactions(data.transactions);
          }
          if (data.customCategories) {
            setCustomCategories(data.customCategories);
          }
          if (data.customCategoryIcons) {
            setCustomCategoryIcons(data.customCategoryIcons);
          }
          showNotification('データをインポートしました', 'success');
        } catch (error) {
          showNotification('ファイルの形式が正しくありません', 'error');
        }
      };
      reader.readAsText(file);
    }
    // ファイル選択をリセットして同じファイルを再度選択できるようにする
    event.target.value = null;
  };

  // --- End of logic ---

  // フィルタリング
  const filteredTransactions = transactions.filter(transaction => {
    const details = transaction.details || transaction.description || ''; // 旧データ対応
    const matchesSearch = details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || transaction.category === filterCategory;
    const matchesType = !filterType || transaction.type === filterType;

    return matchesSearch && matchesCategory && matchesType;
  });

  // 統計計算
  const balance = transactions.reduce((total, transaction) => {
    return transaction.type === 'income'
      ? total + transaction.amount
      : total - transaction.amount;
  }, 0);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpense = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // 金額フォーマット
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  // 日付フォーマット
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors`} style={{position: 'fixed', width: '100%', height: '100%', overflow: 'auto'}}>
      {/* 通知 */}
      {notification && (
        <div className="fixed top-4 left-4 right-4 z-50" style={{pointerEvents: 'none'}}>
          <div className={`p-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-100 text-green-800 border-green-300' :
            notification.type === 'error' ? 'bg-red-100 text-red-800 border-red-300' :
            notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
            'bg-blue-100 text-blue-800 border-blue-300'
          } border`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' && <Check size={16} />}
              {notification.type === 'error' && <AlertCircle size={16} />}
              {notification.type === 'warning' && <AlertCircle size={16} />}
              {notification.type === 'info' && <Info size={16} />}
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <div className="max-w-md mx-auto p-4" style={{paddingBottom: '100px'}}>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Gemini AI家計簿
            </h1>
            <Wallet className="text-blue-600" size={32} />
          </div>
        </div>

        {/* 現在のビューに応じてコンテンツを表示 */}
        {currentView === 'home' && (
          <HomeView
            darkMode={darkMode}
            balance={balance}
            formatAmount={formatAmount}
            monthlyIncome={monthlyIncome}
            monthlyExpense={monthlyExpense}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterType={filterType}
            setFilterType={setFilterType}
            categories={categories}
            filteredTransactions={filteredTransactions}
            categoryIcons={categoryIcons}
            formatDate={formatDate}
            deleteTransaction={deleteTransaction}
            transactions={transactions}
            showTransactionDetails={showTransactionDetails}
          />
        )}
        {currentView === 'add' && (
          <AddView
            darkMode={darkMode}
            type={type}
            setType={setType}
            amount={amount}
            setAmount={setAmount}
            category={category}
            setCategory={setCategory}
            setShowCategoryManager={setShowCategoryManager}
            categories={categories}
            details={details}
            setDetails={setDetails}
            date={date}
            setDate={setDate}
            addTransaction={addTransaction}
          />
        )}
        {currentView === 'aiAnalysis' && (
          <AIAnalysisView
            darkMode={darkMode}
            transactions={transactions}
            formatAmount={formatAmount}
            categories={categories}
            monthlyIncome={monthlyIncome}
            monthlyExpense={monthlyExpense}
            geminiApiKey={geminiApiKey}
            showNotification={showNotification}
          />
        )}
        {currentView === 'stats' && (
          <StatsView
            darkMode={darkMode}
            formatAmount={formatAmount}
            monthlyIncome={monthlyIncome}
            monthlyExpense={monthlyExpense}
            categories={categories}
            monthlyTransactions={monthlyTransactions}
            categoryIcons={categoryIcons}
          />
        )}
        {currentView === 'settings' && (
          <SettingsView
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            autoSave={autoSave}
            setAutoSave={setAutoSave}
            setShowCategoryManager={setShowCategoryManager}
            lastSaved={lastSaved}
            saveData={manualSaveData}
            exportData={exportData}
            importData={importData}
            geminiApiKey={geminiApiKey}
            saveApiKey={saveApiKey}
            showNotification={showNotification}
          />
        )}
      </div>

      {/* ナビゲーションバー */}
      <NavigationBar
        darkMode={darkMode}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* カテゴリ管理モーダル */}
      {showCategoryManager && (
        <CategoryManagerModal
          darkMode={darkMode}
          setShowCategoryManager={setShowCategoryManager}
          newCategoryType={newCategoryType}
          setNewCategoryType={setNewCategoryType}
          newCategoryName={newCategoryName}
          setNewCategoryName={setNewCategoryName}
          newCategoryIcon={newCategoryIcon}
          setNewCategoryIcon={setNewCategoryIcon}
          addCustomCategory={addCustomCategory}
          customCategories={customCategories}
          deleteCustomCategory={deleteCustomCategory}
          availableIcons={availableIcons}
          customCategoryIcons={customCategoryIcons}
        />
      )}

      {/* 取引詳細モーダル */}
      {showTransactionDetail && (
        <TransactionDetailModal
          darkMode={darkMode}
          transaction={selectedTransaction}
          onClose={() => setShowTransactionDetail(false)}
          onEdit={openEditTransaction}
          formatAmount={formatAmount}
          formatDate={formatDate}
          categoryIcons={categoryIcons}
        />
      )}

      {/* 取引編集モーダル */}
      {showEditTransaction && (
        <EditTransactionModal
          darkMode={darkMode}
          transaction={selectedTransaction}
          amount={amount}
          setAmount={setAmount}
          category={category}
          setCategory={setCategory}
          details={details}
          setDetails={setDetails}
          type={type}
          setType={setType}
          date={date}
          setDate={setDate}
          categories={categories}
          onUpdate={updateTransaction}
          onCancel={cancelEdit}
          setShowCategoryManager={setShowCategoryManager}
        />
      )}
    </div>
  );
};

export default SimpleBudgetApp;