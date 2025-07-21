import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Settings, Plus, Edit, Trash2, Save, X, Zap, Target, AlertCircle, CheckCircle, Cloud, Navigation, Search, Map, Home, Car, Train, DollarSign, Brain } from 'lucide-react';

// マップ表示用のモーダルコンポーネント
const MapModal = ({ isOpen, onClose, url, title }) => {
  // Blob URLのクリーンアップ
  useEffect(() => {
    return () => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 flex justify-between items-center border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1">
          <iframe
            src={url}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

const SmartPlannerAI = () => {
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    tavily: '',
    yolp: ''
  });
  const [showSettings, setShowSettings] = useState(false);
  const [plans, setPlans] = useState([]);
  const [newPlanText, setNewPlanText] = useState('');
  const [location, setLocation] = useState('');
  const [planDate, setPlanDate] = useState('');
  const [planTime, setPlanTime] = useState('09:00');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyWeatherData, setHourlyWeatherData] = useState(null);
  const [notification, setNotification] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapUrl, setMapUrl] = useState('');
  const [mapTitle, setMapTitle] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // コンポーネントマウント時の初期化
  useEffect(() => {
    loadSettings();
    loadPlans();
    initializeDarkMode();
    // デフォルトの日付を今日に設定
    setPlanDate(new Date().toISOString().split('T')[0]);
  }, []);

  // ========== 設定・データ管理 ==========
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('smart-planner-settings');
      if (saved) setApiKeys(prev => ({ ...prev, ...JSON.parse(saved) }));
    } catch (error) { console.error('設定の読み込みに失敗:', error); }
  };

  const saveSettings = () => {
    const gemini = document.getElementById('gemini-api-key')?.value.trim() || '';
    const tavily = document.getElementById('tavily-api-key')?.value.trim() || '';
    const yolp = document.getElementById('yolp-api-key')?.value.trim() || '';
    const newApiKeys = { gemini, tavily, yolp };
    setApiKeys(newApiKeys);
    try {
      localStorage.setItem('smart-planner-settings', JSON.stringify(newApiKeys));
      showNotification('設定を保存しました', 'success');
      setShowSettings(false);
    } catch (error) { showNotification('設定の保存に失敗しました', 'error'); }
  };

  const loadPlans = () => {
    try {
      const saved = localStorage.getItem('smart-planner-plans');
      if (saved) setPlans(JSON.parse(saved));
    } catch (error) { console.error('プランの読み込みに失敗:', error); }
  };

  const savePlans = (newPlans) => {
    try {
      localStorage.setItem('smart-planner-plans', JSON.stringify(newPlans));
    } catch (error) { console.error('プランの保存に失敗:', error); }
  };

  const deletePlan = (planId) => {
    if (confirm('このプランを削除しますか？')) {
      const updatedPlans = plans.filter(p => p.id !== planId);
      setPlans(updatedPlans);
      savePlans(updatedPlans);
      showNotification('プランを削除しました', 'info');
    }
  };

  // ========== 位置情報・天気情報 ==========
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      showNotification('位置情報がサポートされていません', 'error');
      return;
    }
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
      });
      const { latitude, longitude } = position.coords;
      const coords = { lat: latitude, lng: longitude };
      setCurrentLocation(coords);
      
      // OpenStreetMap Nominatim APIを使用（CORSフリー）
      const address = await reverseGeocodeWithOSM(coords.lat, coords.lng);
      if (address) {
        setLocation(address);
        showNotification('現在地を取得しました', 'success');
      }
    } catch (error) { 
      showNotification('位置情報の取得に失敗しました', 'error');
      console.error('位置情報エラー:', error);
    }
  };

  // 時間帯の最も一般的な天気を取得
  const getMostCommonWeather = (weatherArray) => {
    if (!weatherArray || weatherArray.length === 0) return '不明';
    const weatherCounts = {};
    weatherArray.forEach(w => {
      weatherCounts[w.weatherDescription] = (weatherCounts[w.weatherDescription] || 0) + 1;
    });
    return Object.entries(weatherCounts).sort((a, b) => b[1] - a[1])[0][0];
  };
  const reverseGeocodeWithOSM = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ja`);
      const data = await response.json();
      return data.display_name || null;
    } catch (error) {
      console.error('OSM逆ジオコーディングエラー:', error);
      return null;
    }
  };

  // OpenStreetMap Nominatim APIを使用したジオコーディング（CORSフリー）
  const geocodeWithOSM = async (location) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1&accept-language=ja`);
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('OSMジオコーディングエラー:', error);
      return null;
    }
  };
  
  // YOLP API関連の関数を修正（エラーハンドリング強化）
  const reverseGeocode = async (lat, lng) => {
    // まずOSMで試行
    const osmResult = await reverseGeocodeWithOSM(lat, lng);
    if (osmResult) return osmResult;
    
    // YOLP APIは使用しない（CORS制限のため）
    showNotification('YOLP APIはブラウザから直接使用できません。代替APIを使用しています。', 'info');
    return null;
  };
  
  const geocodeLocation = async (loc) => {
    if (!loc) return null;
    // OSM APIを使用
    return await geocodeWithOSM(loc);
  };
  
  // 天気データ取得（代替API使用・時間別対応）
  const getWeatherData = async (lat, lng, targetDate = null) => {
    // Open-Meteo APIを使用（無料・CORSフリー）
    try {
      let apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&timezone=Asia/Tokyo`;
      
      // 現在の天気と時間別予報を取得
      apiUrl += '&current_weather=true&hourly=temperature_2m,precipitation,weathercode,windspeed_10m,winddirection_10m,precipitation_probability';
      
      // 必要な日数を計算
      if (targetDate) {
        const today = new Date();
        const target = new Date(targetDate);
        const daysDiff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
        apiUrl += `&forecast_days=${Math.min(Math.max(daysDiff + 1, 1), 16)}`; // 最大16日
      }
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.current_weather) {
        const weather = {
          current: {
            temperature: data.current_weather.temperature,
            weathercode: data.current_weather.weathercode,
            windspeed: data.current_weather.windspeed,
            time: data.current_weather.time
          }
        };
        
        // 時間別天気データを整形
        if (data.hourly) {
          const hourlyData = [];
          for (let i = 0; i < data.hourly.time.length; i++) {
            hourlyData.push({
              time: data.hourly.time[i],
              temperature: data.hourly.temperature_2m[i],
              precipitation: data.hourly.precipitation[i],
              precipitationProbability: data.hourly.precipitation_probability?.[i] || 0,
              weathercode: data.hourly.weathercode[i],
              windspeed: data.hourly.windspeed_10m[i],
              weatherDescription: getWeatherDescription(data.hourly.weathercode[i])
            });
          }
          setHourlyWeatherData(hourlyData);
          weather.hourly = hourlyData;
        }
        
        setWeatherData(weather);
        return weather;
      }
    } catch (error) {
      console.error('天気データ取得エラー:', error);
    }
    return null;
  };
  
  // 天気コードから説明文を生成
  const getWeatherDescription = (code) => {
    const weatherCodes = {
      0: '快晴',
      1: '晴れ', 2: '一部曇り', 3: '曇り',
      45: '霧', 48: '着氷性の霧',
      51: '霧雨（弱）', 53: '霧雨（中）', 55: '霧雨（強）',
      61: '雨（弱）', 63: '雨（中）', 65: '雨（強）',
      71: '雪（弱）', 73: '雪（中）', 75: '雪（強）',
      77: 'みぞれ',
      80: 'にわか雨（弱）', 81: 'にわか雨（中）', 82: 'にわか雨（強）',
      85: 'にわか雪（弱）', 86: 'にわか雪（強）',
      95: '雷雨', 96: '雷雨とひょう（弱）', 99: '雷雨とひょう（強）'
    };
    return weatherCodes[code] || '不明';
  };
  
  // ========== 外部ツール（AIが使用） ==========
  const searchWithTavily = async (query) => {
    if (!apiKeys.tavily) return JSON.stringify({ error: "Tavily APIキーが設定されていません。" });
    setGeneratingStatus(`Webで「${query}」を検索中...`);
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKeys.tavily}` },
        body: JSON.stringify({ query, search_depth: 'advanced', max_results: 5 })
      });
      if (!response.ok) throw new Error(`Tavily API Error: ${response.status}`);
      const results = await response.json();
      
      // 検索結果が空の場合の処理
      if (!results.results || results.results.length === 0) {
        return JSON.stringify({ 
          message: `「${query}」に関する情報は見つかりませんでした。`, 
          found: false,
          results: [] 
        });
      }
      
      // 検索結果を構造化して返す
      return JSON.stringify({
        found: true,
        query: query,
        results: results.results,
        message: `${results.results.length}件の結果が見つかりました`
      });
    } catch (error) {
      console.error('Tavily検索エラー:', error);
      return JSON.stringify({ error: `検索中にエラーが発生しました: ${error.message}`, found: false });
    }
  };

  // ========== AIプラン生成（リトライ機能付き） ==========
  const generatePlan = async () => {
    if (!newPlanText.trim()) {
      showNotification('予定を入力してください', 'warning'); return;
    }
    if (!apiKeys.gemini || !apiKeys.tavily) {
      showNotification('Gemini APIキーとTavily APIキーを設定してください。', 'error'); return;
    }
    if (!planDate) {
      showNotification('予定日を選択してください', 'warning'); return;
    }

    setIsGenerating(true);
    setGeneratingStatus('計画を分析中...');
    setRetryCount(0);

    try {
      setGeneratingStatus('現在地と天候を確認中...');
      let planCoords = currentLocation;
      if (location) {
        const geocoded = await geocodeLocation(location);
        if(geocoded) planCoords = geocoded;
      }
      
      // 指定日時の天気データを取得
      const weatherDataForPlan = planCoords ? await getWeatherData(planCoords.lat, planCoords.lng, planDate) : null;
      
      const finalPlan = await generateAIPlanWithToolsWithRetry(newPlanText, location, weatherDataForPlan, planDate, planTime);
      
      if (finalPlan) {
        setGeneratingStatus('プランを地図に反映中...');
        for (const task of finalPlan.tasks) {
            if(task.location) {
                const taskCoords = await geocodeLocation(task.location);
                if(taskCoords) task.coords = taskCoords;
            }
        }

        const updatedPlans = [finalPlan, ...plans];
        setPlans(updatedPlans);
        savePlans(updatedPlans);
        setNewPlanText('');
        showNotification('プランを生成しました！', 'success');
      } else {
        throw new Error("AIから有効なプランが返されませんでした。");
      }

    } catch (error) {
      console.error('プラン生成エラー:', error);
      showNotification(`プランの生成に失敗しました: ${error.message}`, 'error');
    } finally {
      setIsGenerating(false);
      setGeneratingStatus('');
    }
  };

  // リトライ機能付きのAIプラン生成
  const generateAIPlanWithToolsWithRetry = async (userInput, location, weatherData, planDate, planTime, attempt = 1) => {
    const maxAttempts = 3;
    const baseDelay = 2000; // 2秒
    
    try {
      return await generateAIPlanWithTools(userInput, location, weatherData, planDate, planTime);
    } catch (error) {
      if (error.message.includes('429') && attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1); // 指数バックオフ
        setGeneratingStatus(`APIレート制限に達しました。${delay/1000}秒後に再試行します... (${attempt}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return generateAIPlanWithToolsWithRetry(userInput, location, weatherData, planDate, planTime, attempt + 1);
      }
      throw error;
    }
  };

  const generateAIPlanWithTools = async (userInput, location, weatherData, planDate, planTime) => {
    setGeneratingStatus('AIがプランニングを開始...');
    
    // プロンプトに検索を強制する追加指示を含める
    const searchEnforcementPrompt = `
【最初に必ず実行すること】
以下の検索を必ずsearchWithTavilyツールで実行してください：
1. "${location} 観光スポット おすすめ"
2. "${location} 飲食店 ランチ"
3. ユーザーが言及した具体的な店舗名がある場合は "[店舗名] ${location}"

検索せずにプランを作成することは絶対に禁止です。
`;
    
    const prompt = searchEnforcementPrompt + buildPrompt(userInput, location, weatherData, planDate, planTime);
    const tools = [{
      function_declarations: [{
        name: "searchWithTavily",
        description: "最新の場所、イベント、営業時間、料金、レビューなどの具体的な情報をWebで検索します。必ず使用してください。",
        parameters: { type: "OBJECT", properties: { query: { type: "STRING", description: "検索キーワード" } }, required: ["query"] }
      }]
    }];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKeys.gemini}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], tools: tools })
    });
    
    if (response.status === 429) {
      throw new Error('Gemini API Error: 429 - レート制限に達しました');
    }
    
    if (!response.ok) throw new Error(`Gemini API Error (1st call): ${response.status}`);
    const data = await response.json();

    const aiResponsePart = data.candidates?.[0]?.content?.parts?.[0];
    if (!aiResponsePart) throw new Error("AIから無効な応答がありました。");

    if (aiResponsePart.functionCall) {
      setGeneratingStatus('AIが必要情報をWebで検索中...');
      const { name, args } = aiResponsePart.functionCall;
      if (name === 'searchWithTavily') {
        const toolResult = await searchWithTavily(args.query);
        
        setGeneratingStatus('検索結果を元にプランを最終化中...');
        const finalResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKeys.gemini}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { parts: [{ text: prompt }] },
              { role: "model", parts: [aiResponsePart] },
              { role: "tool", parts: [{ functionResponse: { name: "searchWithTavily", response: { content: toolResult } } }] }
            ],
            tools: tools
          })
        });
        
        if (finalResponse.status === 429) {
          throw new Error('Gemini API Error: 429 - レート制限に達しました');
        }
        
        if (!finalResponse.ok) throw new Error(`Gemini API Error (2nd call): ${finalResponse.status}`);
        const finalData = await finalResponse.json();
        const finalText = finalData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!finalText) throw new Error("AIからの最終応答が不正です。");

        const jsonMatch = finalText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const planData = JSON.parse(jsonMatch[0]);
            return { id: Date.now(), ...planData, userInput, location, planDate, planTime, createdAt: new Date().toISOString() };
        }
      }
    } else if (aiResponsePart.text) {
        const jsonMatch = aiResponsePart.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const planData = JSON.parse(jsonMatch[0]);
            return { id: Date.now(), ...planData, userInput, location, planDate, planTime, createdAt: new Date().toISOString() };
        }
    }
    
    return null;
  };

  const buildPrompt = (userInput, location, weatherData, planDate, planTime) => {
    let context = `【ユーザーの要望】\n${userInput}\n\n【現在地/出発地】\n${location}\n\n`;
    context += `【予定日時】\n${planDate} ${planTime}開始\n\n`;
    
    if (weatherData && weatherData.hourly) {
      context += `【時間別天気予報】\n`;
      // 予定日の天気データを抽出
      const targetDateTime = new Date(`${planDate}T00:00:00`);
      const relevantWeather = weatherData.hourly.filter(h => {
        const hourDate = new Date(h.time);
        return hourDate.toDateString() === targetDateTime.toDateString();
      });
      
      if (relevantWeather.length > 0) {
        // 朝・昼・夕・夜の代表的な時間の天気を表示
        const keyHours = [6, 9, 12, 15, 18, 21];
        keyHours.forEach(hour => {
          const weatherAtHour = relevantWeather.find(w => new Date(w.time).getHours() === hour);
          if (weatherAtHour) {
            context += `- ${hour}時: ${weatherAtHour.weatherDescription}, ${weatherAtHour.temperature}℃, 降水確率${weatherAtHour.precipitationProbability}%, 降水量${weatherAtHour.precipitation}mm\n`;
          }
        });
        
        // 天気の変化を分析
        const morningWeather = relevantWeather.filter(w => {
          const hour = new Date(w.time).getHours();
          return hour >= 6 && hour < 12;
        });
        const afternoonWeather = relevantWeather.filter(w => {
          const hour = new Date(w.time).getHours();
          return hour >= 12 && hour < 18;
        });
        const eveningWeather = relevantWeather.filter(w => {
          const hour = new Date(w.time).getHours();
          return hour >= 18 && hour <= 23;
        });
        
        context += `\n【天気の変化傾向】\n`;
        context += `- 午前: 主に${getMostCommonWeather(morningWeather)}\n`;
        context += `- 午後: 主に${getMostCommonWeather(afternoonWeather)}\n`;
        context += `- 夕方以降: 主に${getMostCommonWeather(eveningWeather)}\n`;
      }
    }

    return `あなたは世界最高の旅行プランナー兼リサーチャーです。

⚠️⚠️⚠️ 超重要警告 ⚠️⚠️⚠️
推測や想像で店舗を提案することは絶対禁止です。
必ずsearchWithTavilyで検索して実在を確認してください。
検索で見つからない店舗は提案しないでください。
この規則に違反すると、ユーザーに大きな迷惑をかけます。

以下の指示に従って、ユーザーのための完璧なスケジュールプランを作成してください。

### 🚨 絶対に守るべきルール 🚨
1. **推測や想像で店舗や場所を提案することは絶対に禁止です**
2. **実在する店舗・施設のみを提案してください**
3. **店舗情報は必ずsearchWithTavilyツールで検索して確認してください**
4. **検索で見つからない場合は、その旨を正直に伝えてください**

### 思考プロセス
1. **分析**: ユーザーの要望とコンテキスト（出発地、天気）を注意深く分析します。

2. **必須の検索項目**（searchWithTavilyツールを使用）:
   - 各店舗/施設が実在するか: 「[店舗名] [地域名] 営業時間」で検索
   - 具体的な住所: 「[店舗名] [地域名] 住所」で検索
   - 営業状況: 「[店舗名] [地域名] 閉店」で確認（閉店していないか）
   
3. **検索結果の扱い**:
   - 検索で見つかった店舗のみを使用する
   - 見つからない場合は「[希望の店舗]は見つかりませんでした。代わりに[実在する類似店舗]はいかがでしょうか」と提案
   - 絶対に架空の店舗を作らない

4. **時間帯別天気の活用**:
   - 提供された時間別天気予報を元に、各タスクの"expectedWeather"フィールドに該当時刻の天気を記載
   - 天気が悪化する時間帯は屋内活動を配置
   - 天気が良い時間帯は屋外活動を配置

5. **統合と計画**: 検索で確認できた実在の情報のみを使用し、天気の変化を考慮してプランを作成します。

6. **出力**: 最終的なプランを、指定されたJSON形式で厳密に出力します。

### 提供されている情報
${context}

### 出力形式（このJSON形式を厳守してください）
{
  "title": "プランのタイトル（魅力的で分かりやすいもの）",
  "summary": "プラン全体の概要と魅力（3～4行で具体的に説明）",
  "estimatedBudget": "予想される一人当たりの予算感（例: 5,000円～8,000円）",
  "tasks": [
    {
      "time": "開始時刻（最初のタスクは${planTime}から開始）",
      "task": "具体的なタスク名（例: スターバックス○○店で朝食）",
      "location": "正確な店舗名と住所（必ず検索結果に基づく）",
      "duration": "滞在時間の目安（例: 45分）",
      "transport": "次の場所への移動手段（例: 徒歩5分, 電車15分など）",
      "notes": "検索で確認できた情報のみ記載（営業時間、定休日、料金など）。検索で見つからなかった情報は「検索で確認できませんでした」と明記",
      "weatherConsideration": "その時間帯の天気を考慮した具体的アドバイス（例: 14時頃から雨の予報のため、折り畳み傘を持参。屋根のある移動ルートを推奨）",
      "expectedWeather": "この時間帯の予想天気（例: 晴れ、気温18℃、降水確率10%）"
    }
  ],
  "totalTime": "総所要時間",
  "tips": [
    "プラン全体を通して役立つヒントやコツ（事実に基づくもの）"
  ],
  "alternatives": [
    "悪天候時の代替案（実在する場所のみ）",
    "時間が押した場合の短縮案"
  ]
}

### ⚠️ 特に重要な注意事項 ⚠️
- **セリア、ダイソー、キャンドゥなどのチェーン店**: その地域に実在するか必ず検索で確認。見つからない場合は提案しない
- **飲食店**: 実在する店舗名と正確な住所を検索で確認してから提案
- **観光地・施設**: 営業状況を検索で確認（閉館・閉園していないか）
- **不確実な情報**: 「おそらく」「たぶん」などの推測表現は使わず、「検索で確認できませんでした」と明記

### ❌ 悪い例（絶対にやってはいけない）
- 「遊佐町にセリアがあります」→ 検索せずに推測で言っている
- 「○○カフェ（住所：遊佐町1-2-3）」→ 架空の住所を作っている
- 「多分この辺にダイソーがあるはずです」→ 推測で話している

### ✅ 良い例（このようにしてください）
- searchWithTavilyで「セリア 遊佐町」を検索 → 結果なし → 「セリアは遊佐町では見つかりませんでした。酒田市の店舗が最寄りです」
- searchWithTavilyで「カフェ 遊佐町」を検索 → 結果あり → 「○○カフェ（住所：実際の検索結果の住所）」
- 検索で見つからない → 「ご希望の店舗は見つかりませんでした」と正直に伝える

### 重要な追加指示（天気に関して）
- **時間帯別の天気変化を必ず考慮**: 晴れから雨への変化、気温の変化などを踏まえてプランを組む
- **屋内・屋外のバランス**: 雨の時間帯は屋内活動を、晴れの時間帯は屋外活動を優先的に配置
- **移動時の天気**: 移動中に天気が変わる場合は、適切な対策（傘、上着など）を"weatherConsideration"に記載
- **開始時刻の考慮**: ユーザーが指定した開始時刻から始まるプランを作成

**最重要**: 検索で存在が確認できない店舗・施設は絶対に提案しないでください。`;
  };
  
  const showPlanOnMap = (plan) => {
    const locationsWithCoords = plan.tasks.filter(t => t.coords?.lat && t.coords?.lng);
    if (locationsWithCoords.length === 0) {
        showNotification('プランに有効な場所情報が含まれていません。', 'info');
        return;
    }

    // ルート付きの地図HTMLを生成
    const mapHtml = generateRouteMapHtml(locationsWithCoords, plan.title);
    const blob = new Blob([mapHtml], { type: 'text/html' });
    const mapUrl = URL.createObjectURL(blob);

    setMapUrl(mapUrl);
    setMapTitle(`「${plan.title}」の地図（ルート表示）`);
    setShowMapModal(true);
  };
  
  // ルート付き地図のHTMLを生成
  const generateRouteMapHtml = (locations, title) => {
    const center = locations[0].coords;
    const coordinates = locations.map(l => [l.coords.lat, l.coords.lng]);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet-polylinedecorator/dist/leaflet.polylineDecorator.js"></script>
    <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100%; }
        .custom-popup { font-size: 14px; }
        .task-number { 
            background: #3b82f6; 
            color: white; 
            border-radius: 50%; 
            width: 30px; 
            height: 30px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: bold; 
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        // 地図を初期化
        const map = L.map('map').setView([${center.lat}, ${center.lng}], 14);
        
        // OpenStreetMapタイルを追加
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // カスタムアイコンを作成
        function createNumberedIcon(number) {
            return L.divIcon({
                className: 'custom-div-icon',
                html: '<div class="task-number">' + number + '</div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, -20]
            });
        }
        
        // マーカーを追加
        const markers = [];
        ${locations.map((location, index) => `
        markers.push(L.marker([${location.coords.lat}, ${location.coords.lng}], {
            icon: createNumberedIcon(${index + 1})
        }).addTo(map).bindPopup('<div class="custom-popup"><strong>【${index + 1}】 ${location.task}</strong><br>${location.time} - ${location.location}</div>'));
        `).join('')}
        
        // 全マーカーが見えるように地図を調整
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
        
        // ルートラインを追加（徒歩経路を想定した簡易版）
        const routeCoordinates = [${coordinates.map(coord => `[${coord[0]}, ${coord[1]}]`).join(', ')}];
        
        // 各地点を結ぶ線を描画
        for (let i = 0; i < routeCoordinates.length - 1; i++) {
            L.polyline([routeCoordinates[i], routeCoordinates[i + 1]], {
                color: '#3b82f6',
                weight: 4,
                opacity: 0.7,
                dashArray: '10, 10'
            }).addTo(map);
            
            // 矢印を追加（方向を示す）
            const start = routeCoordinates[i];
            const end = routeCoordinates[i + 1];
            const midpoint = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
            
            L.polylineDecorator([[start, end]], {
                patterns: [
                    {offset: '50%', repeat: 0, symbol: L.Symbol.arrowHead({pixelSize: 15, polygon: false, pathOptions: {stroke: true, color: '#3b82f6', weight: 3}})}
                ]
            }).addTo(map);
        }
    </script>
</body>
</html>
    `;
  };

  // ========== UI関連 ==========
  const initializeDarkMode = () => {
    const saved = localStorage.getItem('smart-planner-dark-mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'true' || (saved === null && prefersDark);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('smart-planner-dark-mode', newDarkMode);
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const goHome = () => navigate('/');
  const hasAPIKeys = apiKeys.gemini && apiKeys.tavily;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors" style={{position: 'fixed', width: '100%', height: '100%', overflow: 'auto'}}>
      {notification && (
        <div className="fixed top-4 left-4 right-4 z-50">
          <div className={`p-4 rounded-lg shadow-lg border ${
            notification.type === 'success' ? 'bg-green-100 dark:bg-green-800 border-green-300' :
            notification.type === 'error' ? 'bg-red-100 dark:bg-red-800 border-red-300' :
            'bg-yellow-100 dark:bg-yellow-800 border-yellow-300'
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4" style={{paddingBottom: '40px'}}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={goHome} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Home className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                スマート計画立てAI
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">AIがあなたの予定を効率的なスケジュールに変換します</p>
          </div>
          <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
            <span className="hidden sm:inline">設定</span>
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Plus className="w-6 h-6 text-blue-600" />
            新しいプランを作成
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">予定日 <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  value={planDate} 
                  onChange={(e) => setPlanDate(e.target.value)} 
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">開始時刻</label>
                <input 
                  type="time" 
                  value={planTime} 
                  onChange={(e) => setPlanTime(e.target.value)} 
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">出発地</label>
              <div className="flex gap-2">
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="例: 東京駅、渋谷" className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                <button onClick={getCurrentLocation} className="px-4 py-3 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg"><Navigation className="w-5 h-5 text-gray-700 dark:text-gray-300"/></button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">やりたいこと</label>
              <textarea value={newPlanText} onChange={(e) => setNewPlanText(e.target.value)} placeholder="例: 明日、銀行に行って、買い物をして、友達とランチをしたい" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows="3"/>
            </div>
            
            <button onClick={generatePlan} disabled={isGenerating || !newPlanText.trim() || !planDate} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-semibold disabled:cursor-not-allowed">
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{generatingStatus || 'AIで分析中...'}</span>
                </>
              ) : (
                <><Brain className="w-5 h-5" /> AIでプランを作成</>
              )}
            </button>
          </div>
        </div>

        {!hasAPIKeys && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5 w-5 h-5" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">APIキーが未設定です</h3>
                <p className="text-yellow-700 dark:text-yellow-400 text-sm mb-3">AI機能と検索機能を使用するには、設定でGemini APIキーとTavily APIキーを登録してください。</p>
                <p className="text-yellow-700 dark:text-yellow-400 text-sm mb-3">※ YOLP APIキーは不要です（CORSの問題により使用できません）</p>
                <button onClick={() => setShowSettings(true)} className="text-sm bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded transition-colors">設定を開く</button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {plans.length === 0 && !isGenerating && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <Target className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">プランがありません</h3>
              <p className="text-gray-600 dark:text-gray-400">上記から新しいプランを作成してみてください。</p>
            </div>
          )}
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{plan.title}</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{plan.summary}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{plan.totalTime}</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{plan.estimatedBudget}</span>
                      {plan.planDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          予定: {new Date(plan.planDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => showPlanOnMap(plan)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg" title="地図で表示"><Map className="w-5 h-5" /></button>
                    <button onClick={() => deletePlan(plan.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg" title="削除"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>

                <div className="space-y-3 p-6 pt-0">
                  {plan.tasks?.map((task, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">{index + 1}</div>
                        <span className="font-medium text-blue-600 dark:text-blue-400 mt-2">{task.time}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">{task.task}</h4>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{task.location}</span></span>
                          <span className="flex items-center gap-2"><Clock className="w-4 h-4" />{task.duration}</span>
                          {task.transport && (
                            <span className="flex items-center gap-2">
                              {task.transport.includes('徒歩') || task.transport.includes('車') ? <Car className="w-4 h-4" /> : <Train className="w-4 h-4" />}
                              {task.transport}
                            </span>
                          )}
                        </div>
                        {task.notes && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 bg-gray-100 dark:bg-gray-600 p-2 rounded">{task.notes}</p>}
                        {task.expectedWeather && <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1"><Cloud className="w-4 h-4"/> {task.expectedWeather}</p>}
                        {task.weatherConsideration && <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{task.weatherConsideration}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">API設定</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gemini API キー <span className="text-red-500">*</span></label>
                <input type="password" id="gemini-api-key" defaultValue={apiKeys.gemini} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400"><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studioで取得</a></p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tavily API キー <span className="text-red-500">*</span></label>
                <input type="password" id="tavily-api-key" defaultValue={apiKeys.tavily} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400"><a href="https://tavily.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Tavilyで取得</a></p>
              </div>
              <div className="opacity-50">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">YOLP API キー（不要）</label>
                <input type="password" id="yolp-api-key" defaultValue={apiKeys.yolp} disabled className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 cursor-not-allowed"/>
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">CORSの問題により使用できません</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  ※ 地図表示と位置情報はOpenStreetMapとOpen-Meteo APIを使用します（APIキー不要）
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={saveSettings} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">保存</button>
                <button onClick={() => setShowSettings(false)} className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500">キャンセル</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MapModal 
        isOpen={showMapModal} 
        onClose={() => setShowMapModal(false)} 
        url={mapUrl}
        title={mapTitle}
      />
    </div>
  );
};

export default SmartPlannerAI;