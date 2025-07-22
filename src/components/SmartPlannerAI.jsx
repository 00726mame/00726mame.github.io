import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Settings, Plus, Trash2, X, Zap, Target,
  AlertCircle, Cloud, Navigation, Map, Home, Car, Train, Footprints,
  DollarSign, Brain, Sun, Info, Frown, Smile, MapPinned, Flag, ShieldCheck, Route
} from 'lucide-react';

// 地図表示用のモーダルコンポーネント (変更なし)
const MapModal = ({ isOpen, onClose, url, title }) => {
  useEffect(() => {
    return () => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={(e) => { e.stopPropagation(); onClose(); }}>
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
  const [apiKeys, setApiKeys] = useState({ gemini: '', tavily: '' });
  const [showSettings, setShowSettings] = useState(false);
  const [plans, setPlans] = useState([]);
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [newPlanText, setNewPlanText] = useState('');
  const [planDate, setPlanDate] = useState('');
  const [planTime, setPlanTime] = useState('09:00');
  const [transportMode, setTransportMode] = useState('auto');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState('');
  const [notification, setNotification] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapUrl, setMapUrl] = useState('');
  const [mapTitle, setMapTitle] = useState('');

  useEffect(() => {
    loadSettings();
    loadPlans();
    initializeDarkMode();
    setPlanDate(new Date().toISOString().split('T')[0]);
  }, []);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('smart-planner-settings');
      if (saved) setApiKeys(prev => ({ ...prev, ...JSON.parse(saved) }));
    } catch (_error) { console.error('設定の読み込みに失敗:', _error); }
  };

  const saveSettings = () => {
    const gemini = document.getElementById('gemini-api-key')?.value.trim() || '';
    const tavily = document.getElementById('tavily-api-key')?.value.trim() || '';
    const newApiKeys = { gemini, tavily };
    setApiKeys(newApiKeys);
    try {
      localStorage.setItem('smart-planner-settings', JSON.stringify(newApiKeys));
      showNotification('設定を保存しました', 'success');
      setShowSettings(false);
    } catch (_error) { showNotification('設定の保存に失敗しました', 'error'); }
  };

  const loadPlans = () => {
    try {
      const saved = localStorage.getItem('smart-planner-plans');
      if (saved) setPlans(JSON.parse(saved));
    } catch (_error) { console.error('プランの読み込みに失敗:', _error); }
  };

  const savePlans = (newPlans) => {
    try {
      localStorage.setItem('smart-planner-plans', JSON.stringify(newPlans));
    } catch (_error) { console.error('プランの保存に失敗:', _error); }
  };

  const deletePlan = (planId) => {
    if (window.confirm('このプランを削除しますか？')) {
      const updatedPlans = plans.filter(p => p.id !== planId);
      setPlans(updatedPlans);
      savePlans(updatedPlans);
      showNotification('プランを削除しました', 'info');
    }
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      showNotification('位置情報がサポートされていません', 'error'); return;
    }
    setGeneratingStatus("現在地を取得中...");
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 });
      });
      const { latitude, longitude } = position.coords;
      const address = await reverseGeocodeWithOSM(latitude, longitude);
      if (address) {
        setStartLocation(address);
        showNotification('出発地に現在地を設定しました', 'success');
      } else {
        showNotification('現在地の住所を特定できませんでした。', 'warning');
      }
    } catch (_error) {
      showNotification('位置情報の取得に失敗しました', 'error'); console.error('位置情報エラー:', _error);
    } finally {
      setGeneratingStatus("");
    }
  };

  const reverseGeocodeWithOSM = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17&accept-language=ja`);
      if (!response.ok) throw new Error(`Nominatim API Error: ${response.status}`);
      const data = await response.json();
      return data.address.province + data.address.county + data.address.town || null;
    } catch (_error) {
      console.error('OSM逆ジオコーディングエラー:', _error);
      return null;
    }
  };

  const geocodeWithOSM = async (location) => {
    if (!location) return null;
    try {
      const response = await fetch(`https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(location)}`);
      if (!response.ok) throw new Error(`国土地理院APIサーバーエラー: ${response.status}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const firstHit = data[0];
        const [lng, lat] = firstHit.geometry.coordinates;
        return { lat, lng };
      }
      return null;
    } catch (_error) {
      console.error('国土地理院 ジオコーディングエラー:', _error);
      return null;
    }
  };
  
  const getWeatherData = async (lat, lng, date) => {
    try {
      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,precipitation_probability,weathercode&timezone=Asia/Tokyo&start_date=${date}&end_date=${date}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data && data.hourly) {
        return data.hourly.time.map((time, i) => ({
          time: time,
          temperature: data.hourly.temperature_2m[i],
          precipitationProbability: data.hourly.precipitation_probability[i],
          weathercode: data.hourly.weathercode[i],
          weatherDescription: getWeatherDescription(data.hourly.weathercode[i])
        }));
      }
    } catch (_error) { console.error('天気データ取得エラー:', _error); }
    return null;
  };
  
  const getWeatherDescription = (code) => {
    const weatherCodes = {0: '快晴', 1: '晴れ', 2: '一部曇り', 3: '曇り', 45: '霧', 61: '雨(弱)', 63: '雨(中)', 65: '雨(強)', 80: 'にわか雨', 95: '雷雨'};
    return weatherCodes[code] || '不明';
  };

  const callGeminiAPI = async (requestBody) => {
    const modelName = 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKeys.gemini}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Gemini API Error Response:", errorBody);
        throw new Error(`Gemini API Error: ${response.status}. Response: ${errorBody}`);
    }
    const data = await response.json();
    const content = data.candidates?.[0]?.content;
    if (!content) {
        console.error("Invalid response structure from Gemini API:", data);
        throw new Error("AIから無効な応答がありました。");
    }
    return content;
  };

  const searchWithTavily = async (query) => {
    setGeneratingStatus(`Web検索: "${query}"`);
    try {
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: apiKeys.tavily, query, search_depth: 'advanced', max_results: 5, include_answer: true }),
        });
        if (!response.ok) throw new Error(`Tavily API Error: ${response.status}`);
        const data = await response.json();
        return JSON.stringify({ answer: data.answer, results: data.results || [] });
    } catch (error) {
        console.error('Tavily検索エラー:', error);
        return JSON.stringify({ error: `検索エラー: ${error.message}` });
    }
  };

  const generatePlan = async () => {
    if (!destination.trim() || !newPlanText.trim() || !planDate) { showNotification('目的地、やりたいこと、予定日をすべて入力してください', 'warning'); return; }
    if (!apiKeys.gemini || !apiKeys.tavily) { showNotification('APIキーを設定してください', 'error'); return; }

    setIsGenerating(true);
    try {
      setGeneratingStatus(`「${destination}」の情報を収集中...`);
      const geo = await geocodeWithOSM(destination);
      if (!geo) throw new Error(`「${destination}」の場所を特定できませんでした。`);
      
      const weatherData = await getWeatherData(geo.lat, geo.lng, planDate);
      if (!weatherData) throw new Error(`「${destination}」の天気予報を取得できませんでした。`);

      setGeneratingStatus("AIがプランを作成中...");
      const finalPrompt = buildFinalPrompt(startLocation, destination, newPlanText, planDate, planTime, transportMode, weatherData);
      const tools = [{ function_declarations: [{ name: "searchWithTavily", description: "場所、営業時間、料金、住所、実在確認、そして特に重要な『地点間の移動時間』など、最新の具体的な情報をWebで検索します。", parameters: { type: "OBJECT", properties: { query: { type: "STRING" } }, required: ["query"] } }] }];
      
      const conversationHistory = [{ role: 'user', parts: [{ text: finalPrompt }] }];
      const initialRequestBody = {
        contents: conversationHistory,
        tools,
        tool_config: { function_calling_config: { mode: "ANY" } },
      };
      
      let modelResponse = await callGeminiAPI(initialRequestBody);
      
      const functionCalls = modelResponse.parts.filter(part => part.functionCall);
      if (functionCalls.length > 0) {
        conversationHistory.push(modelResponse);
        setGeneratingStatus(`AIが${functionCalls.length}件の情報を同時に検索中...`);
        
        const toolExecutionPromises = functionCalls.map(part => {
          const { name, args } = part.functionCall;
          if (name === 'searchWithTavily') return searchWithTavily(args.query);
          throw new Error(`不明なツール呼び出し: ${name}`);
        });

        const toolResults = await Promise.all(toolExecutionPromises);
        
        conversationHistory.push({
          role: 'tool',
          parts: functionCalls.map((part, i) => ({
            functionResponse: { name: part.functionCall.name, response: { content: toolResults[i] } },
          })),
        });
        
        setGeneratingStatus("検索結果を元にプランを最終化中...");
        const followUpRequestBody = { contents: conversationHistory, tools };
        modelResponse = await callGeminiAPI(followUpRequestBody);
      }
      
      let finalPlan;
      try {
        const planJsonTextMatch = modelResponse.parts[0].text.match(/```json\s*(\{[\s\S]*\})\s*```/);
        if (!planJsonTextMatch || !planJsonTextMatch[1]) throw new Error("AIの応答からJSON部分を見つけられませんでした。");
        finalPlan = JSON.parse(planJsonTextMatch[1]);
      } catch (e) {
        console.error("JSONの解析に失敗しました:", e, "\nAIからのテキスト:", modelResponse.parts[0].text);
        throw new Error("AIが生成したプランの形式が正しくありません。");
      }

      setGeneratingStatus("プランの地図情報を準備中...");
      for (const task of finalPlan.tasks) {
        if (task.isPlottable && task.address && task.address !== 'N/A') {
          const taskGeo = await geocodeWithOSM(task.address);
          if (taskGeo) {
            task.coords = { lat: taskGeo.lat, lng: taskGeo.lng };
          } else {
            console.warn(`ジオコーディング失敗: ${task.address}`);
          }
        }
      }
      
      const newPlan = { id: Date.now(), ...finalPlan, userInput: newPlanText, startLocation, destination, planDate, planTime, transportMode };
      setPlans([newPlan, ...plans]);
      savePlans([newPlan, ...plans]);
      showNotification('新しいプランを生成しました！', 'success');

    } catch (error) {
      console.error('プラン生成エラー:', error);
      showNotification(`プランの生成に失敗しました: ${error.message}`, 'error');
    } finally {
      setIsGenerating(false);
      setGeneratingStatus('');
    }
  };

  const buildFinalPrompt = (startLocation, destination, userInput, date, time, transportMode, weatherData) => {
    let weatherContext = `## 行き先「${destination}」の天気予報 (${date})\n`;
    if(weatherData){
      weatherData.forEach(w => {
        const hour = new Date(w.time).getHours();
        weatherContext += `- ${hour}時: ${w.weatherDescription}, ${w.temperature}°C, 降水確率${w.precipitationProbability}%\n`;
      });
    }
    const transportModeText = { auto: 'AIにおまかせ', driving: '車を優先', transit: '公共交通機関を優先'}[transportMode];

    return `あなたは、共感力と創造性に優れた世界最高のAI旅行コンシェルジュです。以下の情報、思考プロセス、そして絶対的なルール契約に従い、ユーザーに感動を与える完璧なスケジュールを作成してください。

### 🚨 絶対厳守ルール (契約) 🚨
1.  **事実に基づく提案**: 推測や想像は厳禁。全ての情報は\`searchWithTavily\`で確認する。特に**移動時間は必ず検索すること**。
2.  **ツール使用の徹底**: 場所、営業時間、料金、住所、そして**地点間の移動時間**など、必要な情報は**必ず**\`searchWithTavily\`を呼び出して取得する。その際、ユーザーの交通手段の希望(\`${transportModeText}\`)を考慮した検索クエリ（例：「AからB 車 時間」）を生成すること。
3.  **現実的な時間計算**: プラン全体の時間は、**検索して得られた移動時間**と滞在時間を厳密に合計して算出する。希望的観測は含めない。
4.  **出発地と帰宅の考慮**: 「出発地」からの移動と、「出発地」への帰宅を必ず計画に含める。
5.  **天候の最優先**: 提供された天気予報を最重要視し、プラン全体を最適化する。悪天候の場合は代替案を提案する。
6.  **リスク管理**: 考えられるリスク（交通渋滞、混雑、売り切れ等）を予測し、具体的な対策を提案する。
7.  **isPlottableの絶対義務**: 物理的な場所を伴う活動タスクには例外なく\`isPlottable: true\`を、抽象的なタスク（移動、出発、帰宅など）には\`isPlottable: false\`と\`address: "N/A"\`を設定する。
8.  **JSON出力の厳守**: 最終出力は必ず指定されたJSON形式のみとし、他のテキストを一切含めない。
9.  **住所の正確性**: 住所は**必ず番地まで**含めること。検索結果が曖昧な場合は、より具体的なクエリで再検索し、住所を特定すること。
10. **予算の計算**: 検索で見つけた各場所の費用を元に、一人あたりの総予算(\`estimatedBudget\`)を計算して記載すること。
11.  **住所の区切り方と形式**:
    *   **都道府県名、市区町村名、町名、番地の間は必ずスペースで区切る。**
    *   **番地は必ず半角数字とハイフンを使用し、漢字や全角文字は使用しない。**
    *   例：
        *   山形県酒田市ゆたか二丁目9番地の7 → 山形県酒田市ゆたか 2-9-7 (正)
        *   東京都墨田区押上一丁目1番地2 → 東京都墨田区押上 1-1-2 (正)

### ✅ 良いタスクの例

{
  "task": "スカイツリーから展望",
  "location": "東京都墨田区押上 1-1-2",
  "isPlottable": true, // <-- 正しい！物理的な場所
  ...
}

### ❌ 悪いタスクの例

{
  "task": "箱根湯本駅から彫刻の森へ移動",
  "location": "N/A",
  "isPlottable": true, // <-- 間違い！移動は抽象的なタスク
  ...
},
{
  "task": "スカイツリーから展望",
  "location": "東京都墨田区押上1-1-2", // <-- 間違い スペースがない
  "isPlottable": true,
  ...
},
{
  "task": "スカイツリーから展望",
  "location": "東京都墨田区押上 １丁目１−２", // <-- 間違い 全角文字と漢字
  "isPlottable": true,
  ...
},
{
  "task": "スカイツリーから展望",
  "location": "スカイツリーから展望...",
  "isPlottable": false, // <-- 最悪の間違い！物理的な場所なのにfalseになっている
  ...
}

### 思考プロセス
1.  **役割と意図の理解**: 私は「${startLocation || '指定された場所'}」から出発し、「${destination}」へ行くプランを作成し、無事に帰宅させるまでのコンシェルジュである。ユーザーの「${userInput}」という要望の裏にある「どんな体験をしたいのか」を深く洞察する。
2.  **情報収集 (場所・時間・費用)**:
    *   ユーザーの要望を叶えるための候補地を \`searchWithTavily\` で検索し、営業時間、住所、**料金**を特定する。
    *   **最重要**: 各候補地間の移動手段を決定し、**「A地点からB地点 ${transportModeText === '車を優先' ? '車' : '公共交通'} 時間」のように具体的なクエリで \`searchWithTavily\` を使い、現実的な移動時間を検索する。** この検索を省略してはならない。
3.  **プラン構築と創造的統合**:
    *   収集した情報（滞在時間、**検索した移動時間**、費用）に基づき、出発から帰宅まで全てのタスクを時系列に並べる。
    *   単なる移動と活動の羅列ではなく、例えば「賑やかな活動の後は静かなカフェで一休みする」など、体験の質を高める流れを意識して、ユーザーの要望を創造的にプランに織り込む。
4.  **リスク分析と対策**: プラン全体を見通し、交通遅延、混雑、天候急変などのリスクを洗い出し、具体的な対策を\`risksAndMitigation\`に記述する。
5.  **自己評価と修正**: 完成したプランが、絶対厳守ルールを全て守っているか？特に、**移動時間は検索に基づいているか？** \`isPlottable\` は適切か？そして何より、ユーザーの隠れた要望まで満たす、最高の体験を提供できるか？を自問自答し、必要であれば修正を加える。
6.  **最終出力**: 全てのチェックを終えた後、完璧なプランをJSON形式で出力する。

### 提供情報
-   **出発地**: ${startLocation || '指定なし'}
-   **目的地エリア**: ${destination}
-   **ユーザーの要望**: ${userInput}
-   **予定日時**: ${date} ${time}頃から開始
-   **主な交通手段の希望**: ${transportModeText}
${weatherContext}

### 出力形式 (このJSON形式を厳守)
\`\`\`json
{
  "title": "プランの魅力を凝縮したタイトル",
  "summary": "プラン全体の概要と、どんな素晴らしい体験ができるかのハイライト（3～4行）",
  "overallWeatherAssessment": { "isRecommended": true, "assessment": "天気に関する総合評価" },
  "risksAndMitigation": ["想定されるリスクとその対策"],
  "estimatedBudget": "（検索結果を元に計算した一人当たりの予想総費用）",
  "tasks": [
    {
      "time": "HH:MM",
      "task": "具体的なタスク名",
      "address": "正確な住所。移動タスクの場合は'N/A'",
      "duration": "滞在時間の目安",
      "transport": "（検索して得られた移動手段と『正確な所要時間』）",
      "isPlottable": true,
      "whyRecommended": "この場所/活動を特に推薦する理由",
      "notes": "（検索で確認した営業時間や料金情報などを記載）",
      "weatherConsideration": "その時間帯の天気を考慮した具体的なアドバイス"
    }
  ],
  "totalTime": "総所要時間",
  "tips": ["プラン全体で役立つヒントや服装のアドバイス"]
}
\`\`\`
`;
  };

  const showPlanOnMap = async (plan) => {
    const plottableTasks = plan.tasks.filter(t => t.isPlottable && t.coords?.lat && t.coords?.lng);
    let allMapPoints = [...plottableTasks];

    if (plan.startLocation) {
      setGeneratingStatus("出発地の位置情報を取得中...");
      const startGeo = await geocodeWithOSM(plan.startLocation);
      if (startGeo) {
        const startPoint = {
          task: '出発地',
          address: plan.startLocation,
          coords: { lat: startGeo.lat, lng: startGeo.lng },
          isPlottable: true
        };
        allMapPoints.unshift(startPoint);
      } else {
        showNotification(`出発地「${plan.startLocation}」の位置を特定できませんでした。`, 'warning');
      }
      setGeneratingStatus("");
    }

    if (allMapPoints.length < 2) {
        showNotification('ルートを表示するには、地図表示可能な場所が2箇所以上必要です。', 'info');
        return;
    }

    const mapHtml = generateRouteMapHtml(allMapPoints, plan.title);
    const blob = new Blob([mapHtml], { type: 'text/html' });
    const mapUrl = URL.createObjectURL(blob);
    setMapUrl(mapUrl);
    setMapTitle(`「${plan.title}」のルート`);
    setShowMapModal(true);
  };

  const generateRouteMapHtml = (locations, title) => {
    const waypoints = locations.map(l => `L.latLng(${l.coords.lat}, ${l.coords.lng})`);
    const locationData = locations.map(l => ({ task: l.task, address: l.address.replace(/'/g, "\\'") }));

    return `
<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
<style>
  body, #map { margin:0; padding:0; height:100vh; width:100%; }
  .leaflet-routing-container { display: none; }
</style>
</head><body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.min.js"></script>
<script>
  const map = L.map('map').setView([${locations[0].coords.lat}, ${locations[0].coords.lng}], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);

  const waypoints = [${waypoints.join(',\n')}];
  const locationData = ${JSON.stringify(locationData)};

  L.Routing.control({
    waypoints: waypoints,
    routeWhileDragging: true,
    show: false,
    addWaypoints: false,
    createMarker: function(i, waypoint, n) {
      const currentLocation = locationData[i];
      const isStart = currentLocation.task === '出発地';
      const bgColor = isStart ? '#16a34a' : '#3b82f6';
      let markerContent;

      if (isStart) {
        markerContent = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';
      } else {
        const hasStartPoint = locationData[0].task === '出発地';
        markerContent = hasStartPoint ? i : i + 1;
      }

      const marker = L.marker(waypoint.latLng, {
        icon: L.divIcon({
          html: \`<div style="background-color: \${bgColor}; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);">\${markerContent}</div>\`,
          className: 'custom-marker-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      });

      const popupHtml = \`<strong>\${currentLocation.task}</strong><br>\${currentLocation.address.replace(/\\n/g, '<br>')}\`;
      marker.bindPopup(popupHtml);
      return marker;
    },
    lineOptions: {
      styles: [{color: '#3b82f6', opacity: 0.8, weight: 6}]
    }
  }).addTo(map);
</script></body></html>`;
  };

  const initializeDarkMode = () => {
    const isDark = localStorage.getItem('smart-planner-dark-mode') === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('smart-planner-dark-mode', String(newDarkMode));
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const goHome = () => navigate('/');
  const hasAPIKeys = apiKeys.gemini && apiKeys.tavily;

  const WeatherAssessment = ({ assessment }) => {
    if (!assessment) return null;
    const isGood = assessment.isRecommended;
    const bgColor = isGood ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-red-50 dark:bg-red-900/30';
    const textColor = isGood ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300';
    const Icon = isGood ? Smile : Frown;

    return (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${bgColor} ${textColor}`}>
            <Icon className="w-6 h-6 flex-shrink-0 mt-0.5"/>
            <div>
                <h4 className="font-semibold">AIによる天候診断</h4>
                <p>{assessment.assessment}</p>
            </div>
        </div>
    );
  };

  const RiskAssessment = ({ risks }) => {
    if (!risks || risks.length === 0) return null;
    return (
        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
            <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 flex-shrink-0 mt-0.5"/>
                <div>
                    <h4 className="font-semibold">リスクと対策</h4>
                    <ul className="list-disc list-inside mt-1 text-sm space-y-1">
                        {risks.map((risk, i) => <li key={i}>{risk}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    )
  }
  
  const getTransportIcon = (transportText = '') => {
      const text = transportText.toLowerCase();
      if (text.includes('徒歩')) return <Footprints size={16} />;
      if (text.includes('車') || text.includes('driving')) return <Car size={16} />;
      if (text.includes('公共交通') || text.includes('電車') || text.includes('バス') || text.includes('transit')) return <Train size={16} />;
      return <Route size={16}/>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors" style={{position: 'fixed', width: '100%', height: '100%', overflow: 'auto'}}>
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
          <div className={`p-4 rounded-lg shadow-lg border flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' :
            notification.type === 'error' ? 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200' :
            'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-10">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={goHome} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><Home className="w-5 h-5" /></button>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">スマート計画立てAI</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">あなたのための最高のAIコンシェルジュ</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleDarkMode} className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg">{darkMode ? <Sun size={20} /> : <Zap size={20} />}</button>
            <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"><Settings size={20} /><span className="hidden sm:inline">設定</span></button>
          </div>
        </header>

        <main>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Plus className="w-6 h-6 text-blue-600" />新しいプランを作成</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Flag size={16}/>出発地</label>
                      <div className="flex gap-2">
                          <input type="text" value={startLocation} onChange={(e) => setStartLocation(e.target.value)} placeholder="例: 東京駅 (任意)" className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"/>
                          <button onClick={getCurrentLocation} title="現在地を出発地に設定" className="px-4 py-3 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg"><Navigation className="w-5 h-5"/></button>
                      </div>
                  </div>
                  <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><MapPinned size={16}/>目的地 (行きたいエリア) <span className="text-red-500">*</span></label>
                      <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="例: 神奈川県箱根町" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"/>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="date" value={planDate} onChange={(e) => setPlanDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"/>
                <input type="time" value={planTime} onChange={(e) => setPlanTime(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"/>
                <select value={transportMode} onChange={(e) => setTransportMode(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                    <option value="auto">交通手段: AIにおまかせ</option>
                    <option value="driving">交通手段: 車を優先</option>
                    <option value="transit">交通手段: 公共交通機関を優先</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">目的地での具体的な要望 <span className="text-red-500">*</span></label>
                <textarea value={newPlanText} onChange={(e) => setNewPlanText(e.target.value)} placeholder="例: 彫刻の森美術館に行って、美味しい蕎麦を食べ、日帰り温泉でリラックスしたい" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700" rows="3"/>
              </div>
              <button onClick={generatePlan} disabled={isGenerating || !destination.trim() || !newPlanText.trim() || !planDate} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold disabled:cursor-not-allowed">
                {isGenerating ? (<><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>{generatingStatus || 'AIで分析中...'}</span></>) : (<><Brain className="w-5 h-5" /> AIでプランを作成</>)}
              </button>
            </div>
          </div>

          {!hasAPIKeys && (<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-8 flex items-start gap-3"><AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5 w-5 h-5" /><div><h3 className="font-medium text-yellow-800 dark:text-yellow-300">APIキーが未設定です</h3><p className="text-yellow-700 dark:text-yellow-400 text-sm">AI機能を使用するには、設定でGeminiとTavilyのAPIキーを登録してください。</p></div></div>)}

          <div className="space-y-6">
            {plans.length === 0 && !isGenerating && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <Target className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">プランがありません</h3><p className="text-gray-600 dark:text-gray-400">上記から新しいプランを作成してみてください。</p>
              </div>
            )}
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <header className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.title}</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">{plan.summary}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1.5"><Clock size={16} />{plan.totalTime}</span>
                        <span className="flex items-center gap-1.5"><DollarSign size={16} />{plan.estimatedBudget}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={16} />{new Date(plan.planDate).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => showPlanOnMap(plan)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg" title="地図でルート表示"><Route size={20} /></button>
                      <button onClick={() => deletePlan(plan.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg" title="削除"><Trash2 size={20} /></button>
                    </div>
                  </header>

                  <div className="mt-6 space-y-4">
                    <WeatherAssessment assessment={plan.overallWeatherAssessment} />
                    <RiskAssessment risks={plan.risksAndMitigation} />
                    {plan.tasks?.map((task, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center flex-shrink-0 pt-1">
                           <div className={`w-8 h-8 ${task.isPlottable ? 'bg-blue-600' : 'bg-gray-400'} text-white rounded-full flex items-center justify-center text-sm font-semibold`}>
                               {task.isPlottable ? (plan.tasks.filter(t => t.isPlottable).findIndex(t => t.task === task.task) + 1) : '-'}
                           </div>
                           {index < plan.tasks.length - 1 && <div className="w-px h-full bg-gray-300 dark:bg-gray-600 my-2"></div>}
                        </div>
                        <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                          <p className="font-semibold text-blue-600 dark:text-blue-400">{task.time} ({task.duration})</p>
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{task.task}</h4>
                          <div className="space-y-3 text-sm">
                            {task.whyRecommended && <p className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md flex items-start gap-2 text-blue-800 dark:text-blue-200"><Info className="w-4 h-4 mt-0.5 flex-shrink-0"/><span><span className="font-semibold">おすすめ理由:</span> {task.whyRecommended}</span></p>}
                            {task.address && task.address !== 'N/A' && <p className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 flex-shrink-0" /><span>{task.address.replace(/\\n/g, '\n')}</span></p>}
                            {task.transport && <p className="flex items-center gap-2">{getTransportIcon(task.transport)}<span>{task.transport}</span></p>}
                            {task.weatherConsideration && <p className="text-xs p-2 bg-gray-100 dark:bg-gray-600 rounded flex items-start gap-2"><Cloud size={14} className="mt-0.5 flex-shrink-0"/>{task.weatherConsideration}</p>}
                            {task.notes && <p className="text-xs p-2 bg-gray-200 dark:bg-gray-800 rounded">{task.notes}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {plan.tips?.length > 0 && <footer className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><h5 className="font-semibold mb-2">役立つヒント</h5><ul className="list-disc list-inside space-y-1 text-sm">{plan.tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul></footer>}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">API設定</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gemini API キー <span className="text-red-500">*</span></label>
                <input type="password" id="gemini-api-key" defaultValue={apiKeys.gemini} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"/>
                <p className="text-xs mt-1 text-gray-500"><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studioで取得</a></p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tavily API キー <span className="text-red-500">*</span></label>
                <input type="password" id="tavily-api-key" defaultValue={apiKeys.tavily} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"/>
                <p className="text-xs mt-1 text-gray-500"><a href="https://tavily.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Tavilyで取得</a></p>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={saveSettings} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">保存</button>
                <button onClick={() => setShowSettings(false)} className="flex-1 bg-gray-300 dark:bg-gray-600 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500">キャンセル</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MapModal isOpen={showMapModal} onClose={() => setShowMapModal(false)} url={mapUrl} title={mapTitle} />
    </div>
  );
};

export default SmartPlannerAI;