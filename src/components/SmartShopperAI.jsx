import React, { useState, useEffect, useRef } from 'react';
import { Search, Brain, Loader, Image, AlertCircle, CheckCircle, Info, X, Sun, Moon, Settings, Camera } from 'lucide-react';

// APIキーはCanvas環境で自動的に提供されるため、空文字列のままにします。
// ただし、gemini-pro-visionなどgemini-2.0-flash以外のモデルを使用する場合は、ユーザーがAPIキーを入力する必要があります。
const DEFAULT_GEMINI_API_KEY = ""; 
const DEFAULT_TAVILY_API_KEY = ""; 

// Tavily APIの検索対象ドメイン
const TAVILY_DOMAINS = ["amazon.co.jp", "rakuten.co.jp", "kakaku.com", "yodobashi.com", "biccamera.com"];

// APIキーをlocalStorageから取得するヘルパー関数
const getApiKey = (keyName, defaultValue) => {
  return localStorage.getItem(keyName) || defaultValue;
};

// 設定モーダルコンポーネント
const SettingsModal = ({ show, onClose, onSave, darkMode }) => {
  const [geminiApiKey, setGeminiApiKey] = useState(getApiKey('geminiApiKey', DEFAULT_GEMINI_API_KEY));
  const [tavilyApiKey, setTavilyApiKey] = useState(getApiKey('tavilyApiKey', DEFAULT_TAVILY_API_KEY));

  if (!show) return null;

  const handleSave = () => {
    onSave(geminiApiKey, tavilyApiKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all scale-100 opacity-100`}>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center justify-between">
          API設定
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="gemini-api-key" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Gemini API キー <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="gemini-api-key"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            />
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studioで取得</a>
            </p>
          </div>
          <div>
            <label htmlFor="tavily-api-key" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Tavily API キー <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="tavily-api-key"
              value={tavilyApiKey}
              onChange={(e) => setTavilyApiKey(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            />
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
              <a href="https://tavily.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Tavilyで取得</a>
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              保存
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-semibold"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// App -> SmartShopperAI にリネーム
const SmartShopperAI = () => {
  const [userInput, setUserInput] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null); // 選択された画像ファイル
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // 画像プレビュー用URL
  const [imageDescription, setImageDescription] = useState(''); // AIによる画像説明
  const [searchResults, setSearchResults] = useState([]);
  const [aiInsight, setAiInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null); // { message, type }
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // APIキーの状態管理
  const [currentGeminiApiKey, setCurrentGeminiApiKey] = useState(getApiKey('geminiApiKey', DEFAULT_GEMINI_API_KEY));
  const [currentTavilyApiKey, setCurrentTavilyApiKey] = useState(getApiKey('tavilyApiKey', DEFAULT_TAVILY_API_KEY));

  // ダークモードの初期設定と切り替え
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedDarkMode || (localStorage.getItem('darkMode') === null && prefersDark);
    
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  // APIキーの保存ハンドラ
  const handleSaveApiKeys = (geminiKey, tavilyKey) => {
    localStorage.setItem('geminiApiKey', geminiKey);
    localStorage.setItem('tavilyApiKey', tavilyKey);
    setCurrentGeminiApiKey(geminiKey);
    setCurrentTavilyApiKey(tavilyKey);
    showNotification('APIキーを保存しました！', 'success');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    showNotification(newDarkMode ? 'ダークモードを有効にしました' : 'ライトモードを有効にしました', 'info');
  };

  // 通知表示ヘルパー
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // 画像選択時のハンドラ
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setImageDescription(''); // 新しい画像が選ばれたら説明をリセット
    } else {
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
      setImageDescription('');
    }
  };

  // 画像をBase64に変換するヘルパー関数
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result.split(',')[1]); // "data:image/png;base64," の部分を除去
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Gemini Vision APIを呼び出して画像を説明する関数
  const describeImageWithGeminiVision = async (base64ImageData) => {
    showNotification('画像をAIが解析中...', 'info');
    const apiKey = currentGeminiApiKey;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: "この画像に写っている商品の特徴、色、形、用途などを詳細に説明してください。" },
            {
              inlineData: {
                mimeType: selectedImageFile.type,
                data: base64ImageData
              }
            }
          ]
        }
      ],
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini Vision APIエラー: ${response.status} - ${errorData.error.message || response.statusText}`);
      }

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const description = result.candidates[0].content.parts[0].text;
        setImageDescription(description);
        showNotification('画像の解析が完了しました！', 'success');
        return description;
      } else {
        showNotification('画像の解析に失敗しました。', 'warning');
        return '';
      }
    } catch (error) {
      console.error("Gemini Vision API呼び出しエラー:", error);
      showNotification(`画像の解析に失敗しました: ${error.message}`, 'error');
      return '';
    }
  };

  // Tavily APIを呼び出して商品情報を検索する関数
  const fetchProductInfoWithTavily = async (query) => {
    setSearchResults([]); // 以前の結果をクリア
    const payload = {
      query: query,
      search_depth: "advanced",
      include_answer: true,
      include_images: true,
      domains: TAVILY_DOMAINS,
    };

    try {
      showNotification('商品情報を検索中...', 'info');
      const apiUrl = `https://api.tavily.com/search`; // Tavily APIのエンドポイント
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentTavilyApiKey}` // Tavily APIキーをヘッダーに含める
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Tavily APIエラー: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      console.log("Tavily API Response:", result);

      if (result.results && result.results.length > 0) {
        setSearchResults(result.results);
        showNotification('商品情報が見つかりました！', 'success');
        return result.results; // Geminiに渡すために返す
      } else {
        showNotification('関連する商品情報は見つかりませんでした。', 'warning');
        return [];
      }
    } catch (error) {
      console.error("Tavily API呼び出しエラー:", error);
      showNotification(`商品情報の取得に失敗しました: ${error.message}`, 'error');
      return [];
    }
  };

  // Gemini APIを呼び出してAIの洞察や回答を生成する関数
  const getAIInsightWithGemini = async (context, userQuestion) => {
    setAiInsight(''); // 以前の洞察をクリア

    // Tavilyの検索結果をGeminiのプロンプトに含める
    const formattedContext = context.map(item => 
      `タイトル: ${item.title}\nURL: ${item.url}\n抜粋: ${item.content || item.snippet}`
    ).join('\n\n');

    const prompt = `あなたは賢いショッピングアシスタントです。以下の関連する商品情報とユーザーの質問に基づき、専門家のように詳細かつ正確な回答を生成してください。
--- 関連する商品情報 ---
${formattedContext || "情報なし"}
--- ユーザーの質問 ---
${userQuestion}
--- 提供すべき情報 ---
1. 質問への直接的な回答
2. その商品や類似品の長所・短所、特定の状況でのパフォーマンスに関する深い洞察
3. 必要であれば、代替品や考慮すべき他の選択肢も提案`;

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const payload = { contents: chatHistory };
    const apiKey = currentGeminiApiKey; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      showNotification('AIが分析・洞察を生成中...', 'info');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini APIエラー: ${response.status} - ${errorData.error.message || response.statusText}`);
      }

      const result = await response.json();
      console.log("Gemini API Response:", result);

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setAiInsight(text);
        showNotification('AIの洞察が生成されました！', 'success');
      } else {
        showNotification('AIの洞察を生成できませんでした。', 'warning');
      }
    } catch (error) {
      console.error("Gemini API呼び出しエラー:", error);
      setAiInsight('AIの洞察生成中にエラーが発生しました。');
      showNotification(`AIの洞察生成に失敗しました: ${error.message}`, 'error');
    }
  };

  // フォーム送信時のハンドラ
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentGeminiApiKey || !currentTavilyApiKey) {
      showNotification('APIキーを設定してください。', 'error');
      setShowSettings(true); // 設定モーダルを開く
      return;
    }

    if (!userInput.trim() && !selectedImageFile) {
      showNotification('テキストまたは画像を何か入力してください。', 'warning');
      return;
    }

    setLoading(true);
    setSearchResults([]);
    setAiInsight('');
    setImageDescription(''); // 毎回リセット

    let combinedQuery = userInput.trim();
    let imageDesc = '';

    try {
      // ステップ0: 画像が添付されていればGemini Visionで説明を生成
      if (selectedImageFile) {
        const base64Data = await fileToBase64(selectedImageFile);
        imageDesc = await describeImageWithGeminiVision(base64Data);
        if (imageDesc) {
          combinedQuery = `${combinedQuery} ${imageDesc}`.trim();
        }
      }

      // 結合されたクエリが空の場合はエラー
      if (!combinedQuery) {
        showNotification('検索クエリを生成できませんでした。', 'error');
        setLoading(false);
        return;
      }

      // ステップ1: Tavilyで商品情報を検索
      const tavilyResults = await fetchProductInfoWithTavily(combinedQuery);

      // ステップ2: Tavilyの結果と結合されたクエリをGeminiに渡し、洞察を生成
      if (tavilyResults.length > 0) {
        await getAIInsightWithGemini(tavilyResults, combinedQuery);
      } else {
        // Tavilyで結果がなくても、Geminiに直接ユーザーの質問を投げる（一般的な質問応答）
        await getAIInsightWithGemini([], combinedQuery);
      }
      
    } catch (error) {
      console.error("処理全体でエラー:", error);
      showNotification('処理中に予期せぬエラーが発生しました。', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 font-inter transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      {/* 通知コンポーネント */}
      {notification && (
        <div className={`fixed top-4 right-4 p-3 rounded-lg shadow-lg flex items-center gap-2 z-50
          ${notification.type === 'info' ? 'bg-blue-500 text-white' : ''}
          ${notification.type === 'success' ? 'bg-green-500 text-white' : ''}
          ${notification.type === 'warning' ? 'bg-yellow-500 text-white' : ''}
          ${notification.type === 'error' ? 'bg-red-500 text-white' : ''}
        `}>
          {notification.type === 'info' && <Info className="w-5 h-5" />}
          {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {notification.type === 'warning' && <AlertCircle className="w-5 h-5" />}
          {notification.type === 'error' && <X className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* API設定モーダル */}
      <SettingsModal
        show={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveApiKeys}
        darkMode={darkMode}
      />

      {/* ヘッダー */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
          <Search className="w-8 h-8"/> Smart Shopper AI
        </h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSettings(true)} 
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button 
            onClick={toggleDarkMode} 
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>
      </header>

      {/* メインコンテンツエリア */}
      <main className="w-full max-w-4xl bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="探している商品や質問を入力してください（例: 高音質ワイヤレスイヤホン、このスニーカーに似たもの）"
              className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
              disabled={loading}
            />
            <label htmlFor="image-upload" className="flex-shrink-0 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Camera className="w-5 h-5" /> 画像添付
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={loading}
              />
            </label>
          </div>
          {imagePreviewUrl && (
            <div className="mt-2 flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <img src={imagePreviewUrl} alt="商品プレビュー" className="w-24 h-24 object-contain rounded-md border border-gray-300 dark:border-gray-600"/>
              <div className="flex-grow">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">画像を添付しました</p>
                {imageDescription && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{imageDescription}</p>}
              </div>
              <button
                type="button"
                onClick={() => { setSelectedImageFile(null); setImagePreviewUrl(null); setImageDescription(''); }}
                className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" /> 検索中...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" /> 検索＆AI分析
              </>
            )}
          </button>
        </form>

        {/* 結果表示エリア */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-lg text-gray-600 dark:text-gray-300">情報を取得中...</span>
          </div>
        )}

        {!loading && (searchResults.length > 0 || aiInsight) && (
          <div className="mt-8">
            {/* AIの洞察表示 */}
            {aiInsight && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg mb-8 shadow-inner border border-blue-200 dark:border-blue-700">
                <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <Brain className="w-6 h-6"/> AIアシスタントからの洞察
                </h2>
                <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: aiInsight.replace(/\n/g, '<br>') }} />
              </div>
            )}

            {/* 検索結果表示 */}
            {searchResults.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg shadow-inner border border-gray-200 dark:border-gray-600">
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <Search className="w-6 h-6"/> 関連する商品情報
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((result, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-2 line-clamp-2">{result.title}</h3>
                      {result.images && result.images.length > 0 && (
                        <img 
                          src={result.images[0]} 
                          alt={result.title} 
                          className="w-full h-32 object-contain rounded-md mb-3 bg-gray-100 dark:bg-gray-700"
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/150x100/E0E0E0/ADADAD?text=No+Image`; }} // 画像がない場合のフォールバック
                        />
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">{result.content || result.snippet}</p>
                      <a 
                        href={result.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                      >
                        詳細を見る
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 初回メッセージ/結果がない場合のメッセージ */}
        {!loading && searchResults.length === 0 && !aiInsight && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg mb-2">商品を探したり、質問したりしてみましょう！</p>
            <p className="text-sm">例えば、「高音質ワイヤレスイヤホンのおすすめは？」「このスニーカーに似た安いもの」「新しいスマートフォンの選び方」など。</p>
            <p className="text-sm mt-2">画像添付でAIに商品の特徴を伝えられます。</p>
          </div>
        )}
      </main>

      {/* フッター（著作権表示を削除） */}
      <footer className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p className="mt-2">
          <span className="font-semibold">注意:</span> このアプリケーションはデモンストレーション目的であり、APIキーが必要です。
          <br/>Tavily APIはウェブ検索に、Gemini APIはAI分析に使用されます。
          <br/>Keepa APIの統合は概念的に示されており、別途設定が必要です。
        </p>
      </footer>
    </div>
  );
};

export default SmartShopperAI;
