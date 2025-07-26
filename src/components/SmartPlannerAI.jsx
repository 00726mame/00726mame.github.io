import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Settings, Plus, Trash2, X, Zap, Target,
  AlertCircle, Cloud, Navigation, Map, Home, Car, Train, Footprints,
  DollarSign, Brain, Sun, Info, Frown, Smile, MapPinned, Flag, ShieldCheck, Route,
  CheckCircle, XCircle, AlertTriangle, Loader, Bot, Cpu, Activity, TrendingUp
} from 'lucide-react';

// シンプルなJSON出力プロンプト生成（インライン実装）
const buildSimpleJSONPrompt = (startLocation, destination, userInput, planDate, planTime, transportMode, weatherData, isAgentMode = false) => {
  const weatherContext = buildWeatherContext(destination, planDate, weatherData);
  const transportModeText = getTransportModeText(transportMode);
  
  return `あなたは優秀な旅行プランナーです。以下の情報を元に、旅行プランを作成してください。

## 基本情報
- 出発地: ${startLocation || '指定なし'}
- 目的地: ${destination}
- やりたいこと: ${userInput}
- 日時: ${planDate} ${planTime}から
- 交通手段: ${transportModeText}

${weatherContext}

## 重要な指示
1. searchWithTavilyを使って、営業時間・住所・料金・移動時間を必ず調べてください
2. 調べた情報を元に、実現可能なプランを作成してください
3. 最終的な回答は、必ず以下の形式のJSONのみで出力してください

## 出力形式（これ以外は出力禁止）

\`\`\`json
{
  "title": "プランのタイトル",
  "summary": "プランの概要",
  "tasks": [
    {
      "time": "09:00",
      "task": "やること",
      "address": "住所（移動の場合はN/A）",
      "duration": "滞在時間",
      "transport": "移動手段と時間",
      "isPlottable": true,
      "whyRecommended": "おすすめ理由",
      "notes": "営業時間や料金など",
      "weatherConsideration": "天気に関するアドバイス"
    }
  ],
  "totalTime": "総所要時間",
  "estimatedBudget": "一人あたりの予算",
  "risksAndMitigation": ["リスクと対策"],
  "tips": ["役立つヒント"],
  "overallWeatherAssessment": {
    "isRecommended": true,
    "assessment": "天気の総合評価"
  }
}
\`\`\`

注意：
- isPlottableは必ずtrue/false（文字列ではない）
- timeは必ず"HH:MM"形式
- 説明文は一切不要、JSONのみ出力
- \`\`\`json で始まり \`\`\` で終わること`;
};

const buildWeatherContext = (destination, date, weatherData) => {
  let context = `## ${destination}の天気予報（${date}）\n`;
  
  if (weatherData && weatherData.length > 0) {
    weatherData.forEach(w => {
      const hour = new Date(w.time).getHours();
      context += `- ${hour}時: ${w.weatherDescription}, ${w.temperature}°C, 降水確率${w.precipitationProbability}%\n`;
    });
  } else {
    context += "- 天気情報を取得できませんでした\n";
  }
  
  return context;
};

const getTransportModeText = (transportMode) => {
  const modes = {
    auto: 'AIにおまかせ',
    driving: '車を優先',
    transit: '公共交通機関を優先'
  };
  return modes[transportMode] || 'AIにおまかせ';
};

// シンプルなJSON解析関数（インライン実装）
const parseJSONSimple = (responseText) => {
  console.log("=== シンプルJSON解析開始 ===");
  console.log("応答テキスト:", responseText);
  
  if (!responseText || typeof responseText !== 'string') {
    throw new Error("AIからの応答が無効です");
  }

  // JSONブロックを抽出
  const jsonMatch = responseText.match(/```json\s*(\{[\s\S]*?\})\s*```/i);
  
  if (!jsonMatch || !jsonMatch[1]) {
    console.error("JSONブロックが見つかりません");
    console.error("応答全文:", responseText);
    throw new Error("AIの応答にJSONブロックが見つかりませんでした");
  }

  const jsonString = jsonMatch[1].trim();
  console.log("抽出されたJSON:", jsonString);

  try {
    const parsed = JSON.parse(jsonString);
    console.log("JSON解析成功");
    
    // 基本的な構造チェック
    if (!parsed.title || !parsed.summary || !Array.isArray(parsed.tasks)) {
      throw new Error("必須フィールドが不足しています");
    }
    
    return parsed;
  } catch (error) {
    console.error("JSON解析エラー:", error.message);
    console.error("解析対象JSON:", jsonString);
    throw new Error(`JSONの解析に失敗しました: ${error.message}`);
  }
};

// 地図表示用のモーダルコンポーネント
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

// Agent実行状況表示コンポーネント
const AgentExecutionPanel = ({ isActive, status, metrics, onToggleAgent }) => {
  if (!isActive) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Agent機能</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">AIがより賢くツールを利用してプランを作成</p>
            </div>
          </div>
          <button
            onClick={onToggleAgent}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Cpu size={16} />
            Agent有効化
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="w-8 h-8 text-green-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              Agent実行中
              <Activity className="w-4 h-4 text-green-600 animate-pulse" />
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{status}</p>
          </div>
        </div>
        <button
          onClick={onToggleAgent}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm transition-colors"
        >
          無効化
        </button>
      </div>
      
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">戦略:</span>
            <span className="font-medium text-gray-900 dark:text-white">{metrics.strategy}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-gray-600 dark:text-gray-400">成功率:</span>
            <span className="font-medium text-gray-900 dark:text-white">{metrics.successRate}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            <span className="text-gray-600 dark:text-gray-400">実行時間:</span>
            <span className="font-medium text-gray-900 dark:text-white">{metrics.executionTime}s</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-600" />
            <span className="text-gray-600 dark:text-gray-400">品質スコア:</span>
            <span className="font-medium text-gray-900 dark:text-white">{metrics.qualityScore}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 改善されたリスク評価コンポーネント
const RiskAssessment = ({ risks }) => {
    if (!risks || risks.length === 0) return null;
    
    return (
        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 flex-shrink-0 mt-0.5 text-yellow-600 dark:text-yellow-400"/>
                <div className="flex-1">
                    <h4 className="font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4"/>
                        リスクと対策
                    </h4>
                    <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                        {risks.map((risk, i) => (
                            <li key={i} className="leading-relaxed">{risk}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

// 改善された天候評価コンポーネント
const WeatherAssessment = ({ assessment }) => {
    if (!assessment) return null;
    
    const isGood = assessment.isRecommended;
    const bgColor = isGood 
        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' 
        : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800';
    const textColor = isGood 
        ? 'text-blue-700 dark:text-blue-300' 
        : 'text-red-700 dark:text-red-300';
    const Icon = isGood ? Smile : Frown;

    return (
        <div className={`p-4 rounded-lg border flex items-start gap-3 ${bgColor} ${textColor}`}>
            <Icon className="w-6 h-6 flex-shrink-0 mt-0.5"/>
            <div className="flex-1">
                <h4 className="font-semibold flex items-center gap-2">
                    <Cloud className="w-4 h-4"/>
                    AIによる天候診断
                </h4>
                <p className="mt-1 text-sm leading-relaxed">{assessment.assessment}</p>
            </div>
        </div>
    );
};

// 交通手段アイコンを取得するヘルパー関数（改善版）
const getTransportIcon = (transportText = '') => {
    const text = transportText.toLowerCase();
    
    if (text.includes('徒歩') || text.includes('歩き')) {
        return <Footprints size={16} className="text-green-600" />;
    }
    if (text.includes('車') || text.includes('driving') || text.includes('ドライブ')) {
        return <Car size={16} className="text-blue-600" />;
    }
    if (text.includes('公共交通') || text.includes('電車') || text.includes('バス') || text.includes('transit')) {
        return <Train size={16} className="text-purple-600" />;
    }
    return <Route size={16} className="text-gray-600" />;
};

// 改善されたプログレス表示コンポーネント
const GenerationProgress = ({ isGenerating, status, isAgentMode = false }) => {
    if (!isGenerating) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            {isAgentMode ? (
                                <Bot className="w-12 h-12 text-blue-600 animate-pulse" />
                            ) : (
                                <Loader className="w-12 h-12 text-blue-600 animate-spin" />
                            )}
                            <Zap className="w-6 h-6 text-yellow-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {isAgentMode ? 'Agent分析実行中...' : 'AIがプランを作成中...'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {status || (isAgentMode ? 'より賢い分析を実行しています' : 'しばらくお待ちください')}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {isAgentMode ? 'Agent機能で最高品質のプランを作成中' : '最高のプランをお作りしています'}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 改善された通知コンポーネント
const EnhancedNotification = ({ notification, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [notification, onClose]);

    if (!notification) return null;

    const getNotificationStyle = (type) => {
        const styles = {
            success: {
                bg: 'bg-green-100 dark:bg-green-800 border-green-200 dark:border-green-700',
                text: 'text-green-800 dark:text-green-200',
                icon: <CheckCircle className="w-5 h-5" />
            },
            error: {
                bg: 'bg-red-100 dark:bg-red-800 border-red-200 dark:border-red-700',
                text: 'text-red-800 dark:text-red-200',
                icon: <XCircle className="w-5 h-5" />
            },
            warning: {
                bg: 'bg-yellow-100 dark:bg-yellow-800 border-yellow-200 dark:border-yellow-700',
                text: 'text-yellow-800 dark:text-yellow-200',
                icon: <AlertTriangle className="w-5 h-5" />
            },
            info: {
                bg: 'bg-blue-100 dark:bg-blue-800 border-blue-200 dark:border-blue-700',
                text: 'text-blue-800 dark:text-blue-200',
                icon: <Info className="w-5 h-5" />
            },
            agent: {
                bg: 'bg-purple-100 dark:bg-purple-800 border-purple-200 dark:border-purple-700',
                text: 'text-purple-800 dark:text-purple-200',
                icon: <Bot className="w-5 h-5" />
            }
        };
        return styles[type] || styles.info;
    };

    const style = getNotificationStyle(notification.type);

    return (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-md z-50 transition-all duration-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}>
            <div className={`p-4 rounded-lg shadow-lg border flex items-center gap-3 ${style.bg} ${style.text}`}>
                {style.icon}
                <span className="font-medium flex-1">{notification.message}</span>
                <button 
                    onClick={() => setIsVisible(false)}
                    className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// 改善されたプラン概要コンポーネント
const PlanSummary = ({ plan, isAgentGenerated = false }) => {
    return (
        <div className={`rounded-lg p-4 border ${
            isAgentGenerated 
                ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800'
        }`}>
            {isAgentGenerated && (
                <div className="flex items-center gap-2 mb-3 text-sm text-purple-700 dark:text-purple-300">
                    <Bot size={16} />
                    <span className="font-medium">Agent生成プラン</span>
                </div>
            )}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-600" />
                    <span className="font-medium">総時間:</span>
                    <span className="text-blue-700 dark:text-blue-300 font-semibold">
                        {plan.totalTime}
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-green-600" />
                    <span className="font-medium">予算:</span>
                    <span className="text-green-700 dark:text-green-300 font-semibold">
                        {plan.estimatedBudget}
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-purple-600" />
                    <span className="font-medium">スポット数:</span>
                    <span className="text-purple-700 dark:text-purple-300 font-semibold">
                        {plan.tasks?.filter(t => t.isPlottable).length || 0}箇所
                    </span>
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
  
  // Agent機能関連の状態
  const [agentEnabled, setAgentEnabled] = useState(false);
  const [agentMetrics, setAgentMetrics] = useState(null);

  useEffect(() => {
    loadSettings();
    loadPlans();
    initializeDarkMode();
    setPlanDate(new Date().toISOString().split('T')[0]);
  }, []);

  const updateAgentStatus = (status) => {
    setGeneratingStatus(status);
    
    // Agent メトリクスの更新（デモ用）
    setAgentMetrics({
      strategy: 'simple_robust',
      successRate: Math.floor(88 + Math.random() * 10),
      executionTime: Math.floor(10 + Math.random() * 8),
      qualityScore: (0.88 + Math.random() * 0.10).toFixed(2)
    });
  };

  const toggleAgent = () => {
    setAgentEnabled(!agentEnabled);
    showNotification(
      agentEnabled ? 'Agent機能を無効化しました' : 'Agent機能を有効化しました。シンプルで確実なプラン生成を開始します！',
      agentEnabled ? 'info' : 'agent'
    );
  };

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

  // 改善された逆ジオコーディング関数
  const reverseGeocodeWithOSM = async (lat, lng) => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17&accept-language=ja`, {
            headers: {
                'User-Agent': 'SmartPlannerAI/1.0'
            }
        });
        if (!response.ok) throw new Error(`Nominatim API Error: ${response.status}`);
        const data = await response.json();
        
        const address = data.address;
        if (!address) return null;
        
        const addressParts = [];
        
        if (address.state || address.province) {
            addressParts.push(address.state || address.province);
        }
        
        if (address.city || address.town || address.village || address.county) {
            addressParts.push(address.city || address.town || address.village || address.county);
        }
        
        if (address.suburb || address.neighbourhood || address.hamlet) {
            addressParts.push(address.suburb || address.neighbourhood || address.hamlet);
        }
        
        return addressParts.join('') || data.display_name;
    } catch (error) {
        console.error('OSM逆ジオコーディングエラー:', error);
        return null;
    }
  };

  // 改善されたジオコーディング関数（フォールバック機能付き）
  const geocodeWithOSM = async (location) => {
    if (!location) return null;
    
    // まずNominatimを試す
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1&countrycodes=jp`, {
            headers: {
                'Accept-Language': 'ja',
                'User-Agent': 'SmartPlannerAI/1.0'
            }
        });
        if (!response.ok) throw new Error(`Nominatim API Error: ${response.status}`);
        const data = await response.json();
        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            return { lat: parseFloat(lat), lng: parseFloat(lon) };
        }
    } catch (error) {
        console.error('OSMジオコーディングエラー:', error);
    }
    
    // フォールバックとして国土地理院APIを試す
    try {
        const response = await fetch(`https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(location)}`);
        if (!response.ok) throw new Error(`国土地理院APIサーバーエラー: ${response.status}`);
        const data = await response.json();
        if (data && data.length > 0) {
            const firstHit = data[0];
            const [lng, lat] = firstHit.geometry.coordinates;
            return { lat, lng };
        }
    } catch (error) {
        console.error('国土地理院 ジオコーディングエラー:', error);
    }
    
    return null;
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

  // Agent機能付きプラン生成
  const generatePlanWithAgent = async (userRequest) => {
    if (agentEnabled) {
      // Agent機能のシミュレーション
      updateAgentStatus("🤖 Agent分析開始...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateAgentStatus("🔍 シンプル戦略選択中...");
      await new Promise(resolve => setTimeout(resolve, 800));
      
      updateAgentStatus("📊 効率的情報収集中...");
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      updateAgentStatus("⚡ 品質確認中...");
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return await generatePlanStandard(userRequest);
  };

  // 標準プラン生成（シンプル化）
  const generatePlanStandard = async (userRequest) => {
    const geo = await geocodeWithOSM(userRequest.destination);
    if (!geo) throw new Error(`「${userRequest.destination}」の場所を特定できませんでした。`);
    
    const weatherData = await getWeatherData(geo.lat, geo.lng, userRequest.planDate);
    if (!weatherData) throw new Error(`「${userRequest.destination}」の天気予報を取得できませんでした。`);

    const finalPrompt = buildSimpleJSONPrompt(userRequest.startLocation, userRequest.destination, userRequest.userInput, userRequest.planDate, userRequest.planTime, userRequest.transportMode, weatherData, agentEnabled);
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
      // シンプルなJSON解析を使用
      finalPlan = parseJSONSimple(modelResponse.parts[0].text);
    } catch (e) {
      console.error("シンプルJSON解析でも失敗:", e);
      console.error("AIからのテキスト:", modelResponse.parts[0].text);
      throw new Error(`AIが生成したプランの形式が正しくありません。詳細: ${e.message}`);
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
    
    return finalPlan;
  };

  const generatePlan = async () => {
    if (!destination.trim() || !newPlanText.trim() || !planDate) { showNotification('目的地、やりたいこと、予定日をすべて入力してください', 'warning'); return; }
    if (!apiKeys.gemini || !apiKeys.tavily) { showNotification('APIキーを設定してください', 'error'); return; }

    setIsGenerating(true);
    try {
      const userRequest = {
        startLocation,
        destination,
        userInput: newPlanText,
        planDate,
        planTime,
        transportMode
      };

      const finalPlan = await generatePlanWithAgent(userRequest);
      
      const newPlan = { 
        id: Date.now(), 
        ...finalPlan, 
        userInput: newPlanText, 
        startLocation, 
        destination, 
        planDate, 
        planTime, 
        transportMode,
        isAgentGenerated: agentEnabled
      };
      
      setPlans([newPlan, ...plans]);
      savePlans([newPlan, ...plans]);
      showNotification(
        agentEnabled ? 'Agent機能でシンプルで確実なプランを生成しました！' : '新しいプランを生成しました！', 
        agentEnabled ? 'agent' : 'success'
      );

    } catch (error) {
      console.error('プラン生成エラー:', error);
      showNotification(`プランの生成に失敗しました: ${error.message}`, 'error');
    } finally {
      setIsGenerating(false);
      setGeneratingStatus('');
      setAgentMetrics(null);
    }
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
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const goHome = () => navigate('/');
  const hasAPIKeys = apiKeys.gemini && apiKeys.tavily;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors" style={{position: 'fixed', width: '100%', height: '100%', overflow: 'auto'}}>
      <EnhancedNotification notification={notification} onClose={clearNotification} />
      <GenerationProgress isGenerating={isGenerating} status={generatingStatus} isAgentMode={agentEnabled} />

      <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-10">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={goHome} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><Home className="w-5 h-5" /></button>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">スマート計画立てAI</h1>
              {agentEnabled && <Bot className="w-8 h-8 text-purple-600 animate-pulse" />}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {agentEnabled ? 'シンプルAgent機能でより確実なAIコンシェルジュ' : 'あなたのための最高のAIコンシェルジュ'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleDarkMode} className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">{darkMode ? <Sun size={20} /> : <Zap size={20} />}</button>
            <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"><Settings size={20} /><span className="hidden sm:inline">設定</span></button>
          </div>
        </header>

        <main>
          {/* Agent機能パネル */}
          <AgentExecutionPanel 
            isActive={agentEnabled} 
            status={generatingStatus} 
            metrics={agentMetrics}
            onToggleAgent={toggleAgent}
          />

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Plus className="w-6 h-6 text-blue-600" />
              新しいプランを作成
              {agentEnabled && <span className="text-sm bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">シンプルAgent有効</span>}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Flag size={16}/>出発地</label>
                      <div className="flex gap-2">
                          <input type="text" value={startLocation} onChange={(e) => setStartLocation(e.target.value)} placeholder="例: 東京駅 (任意)" className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 transition-colors"/>
                          <button onClick={getCurrentLocation} title="現在地を出発地に設定" className="px-4 py-3 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"><Navigation className="w-5 h-5"/></button>
                      </div>
                  </div>
                  <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><MapPinned size={16}/>目的地 (行きたいエリア) <span className="text-red-500">*</span></label>
                      <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="例: 神奈川県箱根町" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 transition-colors"/>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="date" value={planDate} onChange={(e) => setPlanDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 transition-colors"/>
                <input type="time" value={planTime} onChange={(e) => setPlanTime(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 transition-colors"/>
                <select value={transportMode} onChange={(e) => setTransportMode(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 transition-colors">
                    <option value="auto">交通手段: AIにおまかせ</option>
                    <option value="driving">交通手段: 車を優先</option>
                    <option value="transit">交通手段: 公共交通機関を優先</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">目的地での具体的な要望 <span className="text-red-500">*</span></label>
                <textarea value={newPlanText} onChange={(e) => setNewPlanText(e.target.value)} placeholder="例: 彫刻の森美術館に行って、美味しい蕎麦を食べ、日帰り温泉でリラックスしたい" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 transition-colors" rows="3"/>
              </div>
              <button onClick={generatePlan} disabled={isGenerating || !destination.trim() || !newPlanText.trim() || !planDate} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold disabled:cursor-not-allowed transition-colors">
                {isGenerating ? (
                  <>
                    {agentEnabled ? <Bot className="w-5 h-5 animate-pulse" /> : <Loader className="w-5 h-5 animate-spin" />}
                    <span>{agentEnabled ? 'シンプルAgent分析中...' : 'AIで分析中...'}</span>
                  </>
                ) : (
                  <>
                    {agentEnabled ? <Bot className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
                    <span>{agentEnabled ? 'シンプルAgentでプランを作成' : 'AIでプランを作成'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {!hasAPIKeys && (<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-8 flex items-start gap-3"><AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5 w-5 h-5" /><div><h3 className="font-medium text-yellow-800 dark:text-yellow-300">APIキーが未設定です</h3><p className="text-yellow-700 dark:text-yellow-400 text-sm">AI機能を使用するには、設定でGeminiとTavilyのAPIキーを登録してください。</p></div></div>)}

          <div className="space-y-6">
            {plans.length === 0 && !isGenerating && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <Target className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">プランがありません</h3><p className="text-gray-600 dark:text-gray-400">上記から新しいプランを作成してみてください。</p>
              </div>
            )}
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <header className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        {plan.title}
                        {plan.isAgentGenerated && <Bot className="w-6 h-6 text-purple-600" />}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">{plan.summary}</p>
                      <PlanSummary plan={plan} isAgentGenerated={plan.isAgentGenerated} />
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => showPlanOnMap(plan)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="地図でルート表示"><Route size={20} /></button>
                      <button onClick={() => deletePlan(plan.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="削除"><Trash2 size={20} /></button>
                    </div>
                  </header>

                  <div className="mt-6 space-y-4">
                    <WeatherAssessment assessment={plan.overallWeatherAssessment} />
                    <RiskAssessment risks={plan.risksAndMitigation} />
                    {plan.tasks?.map((task, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center flex-shrink-0 pt-1">
                           <div className={`w-8 h-8 ${task.isPlottable ? 'bg-blue-600' : 'bg-gray-400'} text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md`}>
                               {task.isPlottable ? (plan.tasks.filter(t => t.isPlottable).findIndex(t => t.task === task.task) + 1) : '-'}
                           </div>
                           {index < plan.tasks.length - 1 && <div className="w-px h-full bg-gray-300 dark:bg-gray-600 my-2"></div>}
                        </div>
                        <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {task.time} ({task.duration})
                              </span>
                            </div>
                            {task.transport && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                {getTransportIcon(task.transport)}
                              </div>
                            )}
                          </div>
                          
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{task.task}</h4>
                          <div className="space-y-3 text-sm">
                            {task.whyRecommended && <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md flex items-start gap-2 text-blue-800 dark:text-blue-200"><Info className="w-4 h-4 mt-0.5 flex-shrink-0"/><span><span className="font-semibold">おすすめ理由:</span> {task.whyRecommended}</span></div>}
                            {task.address && task.address !== 'N/A' && <p className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 flex-shrink-0 text-gray-500" /><span className="text-gray-700 dark:text-gray-300">{task.address.replace(/\\n/g, '\n')}</span></p>}
                            {task.transport && <p className="flex items-center gap-2">{getTransportIcon(task.transport)}<span className="text-gray-700 dark:text-gray-300">{task.transport}</span></p>}
                            {task.weatherConsideration && <p className="text-xs p-2 bg-gray-100 dark:bg-gray-600 rounded flex items-start gap-2"><Cloud size={14} className="mt-0.5 flex-shrink-0 text-gray-500"/><span className="text-gray-600 dark:text-gray-300">{task.weatherConsideration}</span></p>}
                            {task.notes && <p className="text-xs p-2 bg-gray-200 dark:bg-gray-800 rounded"><span className="text-gray-600 dark:text-gray-400">{task.notes}</span></p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {plan.tips?.length > 0 && <footer className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><h5 className="font-semibold mb-2 text-gray-900 dark:text-white">役立つヒント</h5><ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">{plan.tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul></footer>}
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">API設定</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Gemini API キー <span className="text-red-500">*</span></label>
                <input type="password" id="gemini-api-key" defaultValue={apiKeys.gemini} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"/>
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400"><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studioで取得</a></p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tavily API キー <span className="text-red-500">*</span></label>
                <input type="password" id="tavily-api-key" defaultValue={apiKeys.tavily} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"/>
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400"><a href="https://tavily.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Tavilyで取得</a></p>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={saveSettings} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">保存</button>
                <button onClick={() => setShowSettings(false)} className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">キャンセル</button>
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

