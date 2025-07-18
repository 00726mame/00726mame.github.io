import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, MinusCircle, Wallet, TrendingUp, TrendingDown, Calendar, Download, Upload, Settings, BarChart3, Filter, Search, RefreshCw, Database, Eye, EyeOff, Menu, X, Check, Info, AlertCircle, Trash2, Edit3, Home, Car, Utensils, ShoppingCart, Heart, Briefcase, GraduationCap, Plane, Coffee, Gift, Music, Smartphone, Gamepad2, Sun, Moon } from 'lucide-react';

// --- 修正点 1: コンポーネントを外に定義 ---
// 各コンポーネントが必要とするstateや関数をpropsとして受け取るように変更

const NavigationBar = ({ darkMode, currentView, setCurrentView }) => (
  <div className={`fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t`} style={{zIndex: 1000}}>
    <div className="flex justify-around py-2" style={{maxWidth: '400px', margin: '0 auto'}}>
      <button
        onClick={() => setCurrentView('home')}
        className={`flex flex-col items-center py-2 px-4 rounded ${
          currentView === 'home' 
            ? 'text-blue-600' 
            : darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
        style={{minHeight: '60px'}}
      >
        <Home size={24} />
        <span className="text-xs mt-1">ホーム</span>
      </button>
      
      <button
        onClick={() => setCurrentView('add')}
        className={`flex flex-col items-center py-2 px-4 rounded ${
          currentView === 'add' 
            ? 'text-blue-600' 
            : darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
        style={{minHeight: '60px'}}
      >
        <PlusCircle size={24} />
        <span className="text-xs mt-1">追加</span>
      </button>
      
      <button
        onClick={() => setCurrentView('stats')}
        className={`flex flex-col items-center py-2 px-4 rounded ${
          currentView === 'stats' 
            ? 'text-blue-600' 
            : darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
        style={{minHeight: '60px'}}
      >
        <BarChart3 size={24} />
        <span className="text-xs mt-1">統計</span>
      </button>
      
      <button
        onClick={() => setCurrentView('settings')}
        className={`flex flex-col items-center py-2 px-4 rounded ${
          currentView === 'settings' 
            ? 'text-blue-600' 
            : darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
        style={{minHeight: '60px'}}
      >
        <Settings size={24} />
        <span className="text-xs mt-1">設定</span>
      </button>
    </div>
  </div>
);

const HomeView = ({
  darkMode, balance, formatAmount, monthlyIncome, monthlyExpense, searchTerm, setSearchTerm,
  showFilters, setShowFilters, filterCategory, setFilterCategory, filterType, setFilterType,
  categories, filteredTransactions, categoryIcons, formatDate, deleteTransaction, transactions
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
            return (
              <div
                key={transaction.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    <IconComponent size={16} />
                  </div>
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {transaction.description}
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
                    onClick={() => deleteTransaction(transaction.id)}
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
  setShowCategoryManager, categories, description, setDescription, date, setDate, addTransaction
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

        {/* 説明 */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            説明
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="説明を入力"
            className={`w-full px-3 py-3 border rounded-md ${
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
  lastSaved, saveData, exportData, importData
}) => (
  <div className="pb-20 space-y-4">
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
      <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        設定
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

const CategoryManagerModal = ({
  darkMode, setShowCategoryManager, newCategoryType, setNewCategoryType, newCategoryName,
  setNewCategoryName, addCustomCategory, customCategories, deleteCustomCategory
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
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
          </div>
        </div>

        {/* カスタムカテゴリ一覧 */}
        <div className="max-h-48 overflow-y-auto">
          <div className="space-y-4">
            {/* 収入カテゴリ */}
            {customCategories.income.length > 0 && (
              <div>
                <h4 className={`font-medium mb-2 text-green-600`}>収入カテゴリ</h4>
                <div className="space-y-2">
                  {customCategories.income.map(cat => (
                    <div key={cat} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm text-green-800">{cat}</span>
                      <button
                        onClick={() => deleteCustomCategory(cat, 'income')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 支出カテゴリ */}
            {customCategories.expense.length > 0 && (
              <div>
                <h4 className={`font-medium mb-2 text-red-600`}>支出カテゴリ</h4>
                <div className="space-y-2">
                  {customCategories.expense.map(cat => (
                    <div key={cat} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <span className="text-sm text-red-800">{cat}</span>
                      <button
                        onClick={() => deleteCustomCategory(cat, 'expense')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
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
  </div>
);


const SimpleBudgetApp = () => {
  // 基本データ
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // UI状態
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentView, setCurrentView] = useState('home'); // home, add, stats, settings
  
  // 設定
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  
  // 通知
  const [notification, setNotification] = useState(null);

  // カテゴリ管理
  const [customCategories, setCustomCategories] = useState({
    income: [],
    expense: []
  });
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('expense');

  // --- 修正点 2: 不要になったフォーカス管理のstateとrefを削除 ---
  // const amountInputRef = useRef(null);
  // const descriptionInputRef = useRef(null);
  // const [focusedInput, setFocusedInput] = useState(null);

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

  // カテゴリーアイコン
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
    'その他': Coffee
  };

  // 自動保存
  useEffect(() => {
    if (autoSave && transactions.length > 0) {
      const timeoutId = setTimeout(() => {
        saveData();
      }, 2000); // 2秒後に自動保存
      return () => clearTimeout(timeoutId);
    }
  }, [transactions, autoSave]);

  // 初期データ読み込み
  useEffect(() => {
    loadData();
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  // ダークモード適用
  useEffect(() => {
    document.body.className = darkMode ? 'dark' : '';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // データ保存
  const saveData = () => {
    try {
      const data = {
        transactions,
        customCategories,
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
        if (data.timestamp) {
          setLastSaved(new Date(data.timestamp));
        }
      }
    } catch (error) {
      showNotification('データの読み込みに失敗しました', 'error');
    }
  };

  // 通知表示
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // 取引追加
  const addTransaction = () => {
    if (!amount || !category || !description) {
      showNotification('すべての項目を入力してください', 'warning');
      return;
    }

    const newTransaction = {
      id: Date.now(),
      amount: parseFloat(amount),
      category,
      description,
      type,
      date,
      timestamp: new Date().toISOString()
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setAmount('');
    setCategory('');
    setDescription('');
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

    setNewCategoryName('');
    showNotification('カテゴリを追加しました', 'success');
  };

  const deleteCustomCategory = (categoryName, categoryType) => {
    setCustomCategories(prev => ({
      ...prev,
      [categoryType]: prev[categoryType].filter(cat => cat !== categoryName)
    }));
    showNotification('カテゴリを削除しました', 'info');
  };

  // --- 修正点 3: 不要になったフォーカス管理のuseEffectを削除 ---

  // 取引削除
  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showNotification('取引を削除しました', 'info');
  };

  // データエクスポート
  const exportData = () => {
    const data = {
      transactions,
      customCategories,
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
    if (file) {
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
          showNotification('データをインポートしました', 'success');
        } catch (error) {
          showNotification('ファイルの形式が正しくありません', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  // フィルタリング
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
              家計簿
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
            description={description}
            setDescription={setDescription}
            date={date}
            setDate={setDate}
            addTransaction={addTransaction}
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
            saveData={saveData}
            exportData={exportData}
            importData={importData}
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
          addCustomCategory={addCustomCategory}
          customCategories={customCategories}
          deleteCustomCategory={deleteCustomCategory}
        />
      )}
    </div>
  );
};

export default SimpleBudgetApp;