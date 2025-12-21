import React, { useState } from 'react';
import { Cloud, CloudRain, CloudSnow, Wind, AlertTriangle } from 'lucide-react';

interface Alert {
  id: string;
  type: string;
  severity: '주의' | '경보' | '특보';
  message: string;
  time: string;
}

export function WeatherAlert() {
  // 기상 특보 상태 (예시 데이터)
  const [weatherStatus, setWeatherStatus] = useState({
    rain: true,
    snow: false,
    typhoon: false,
  });

  // 오늘의 재난재해 특보 목록
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: '강풍',
      severity: '주의',
      message: '강풍으로 인한 시설물 점검이 필요합니다',
      time: '08:30',
    },
    {
      id: '2',
      type: '집중호우',
      severity: '경보',
      message: '집중호우 예상, 배수시설 확인 바랍니다',
      time: '09:15',
    },
  ]);

  const toggleWeather = (type: 'rain' | 'snow' | 'typhoon') => {
    setWeatherStatus(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case '특보':
        return 'bg-red-100 text-red-700';
      case '경보':
        return 'bg-orange-100 text-orange-700';
      case '주의':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-lg">
          <Cloud className="w-6 h-6 text-blue-700" />
        </div>
        <div>
          <h2 className="text-blue-800">오늘의 기상특보</h2>
          <p className="text-blue-600 text-sm">날씨 현황 및 재난재해 알림</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 왼쪽: 기상 상태 버튼 */}
        <div className="space-y-4">
          <h3 className="text-gray-700 mb-3">기상 현황</h3>
          
          {/* 비 */}
          <button
            onClick={() => toggleWeather('rain')}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              weatherStatus.rain
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${
                weatherStatus.rain ? 'bg-blue-500' : 'bg-gray-300'
              }`}>
                <CloudRain className={`w-6 h-6 ${
                  weatherStatus.rain ? 'text-white' : 'text-gray-500'
                }`} />
              </div>
              <div className="text-left flex-1">
                <div className="text-gray-800">비</div>
                <div className={`text-sm ${
                  weatherStatus.rain ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {weatherStatus.rain ? '예보 있음' : '예보 없음'}
                </div>
              </div>
              {weatherStatus.rain && (
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </button>

          {/* 눈 */}
          <button
            onClick={() => toggleWeather('snow')}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              weatherStatus.snow
                ? 'border-cyan-500 bg-cyan-50 shadow-lg'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${
                weatherStatus.snow ? 'bg-cyan-500' : 'bg-gray-300'
              }`}>
                <CloudSnow className={`w-6 h-6 ${
                  weatherStatus.snow ? 'text-white' : 'text-gray-500'
                }`} />
              </div>
              <div className="text-left flex-1">
                <div className="text-gray-800">눈</div>
                <div className={`text-sm ${
                  weatherStatus.snow ? 'text-cyan-600' : 'text-gray-500'
                }`}>
                  {weatherStatus.snow ? '예보 있음' : '예보 없음'}
                </div>
              </div>
              {weatherStatus.snow && (
                <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </button>

          {/* 태풍 */}
          <button
            onClick={() => toggleWeather('typhoon')}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              weatherStatus.typhoon
                ? 'border-red-500 bg-red-50 shadow-lg'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${
                weatherStatus.typhoon ? 'bg-red-500' : 'bg-gray-300'
              }`}>
                <Wind className={`w-6 h-6 ${
                  weatherStatus.typhoon ? 'text-white' : 'text-gray-500'
                }`} />
              </div>
              <div className="text-left flex-1">
                <div className="text-gray-800">태풍</div>
                <div className={`text-sm ${
                  weatherStatus.typhoon ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {weatherStatus.typhoon ? '예보 있음' : '예보 없음'}
                </div>
              </div>
              {weatherStatus.typhoon && (
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </button>
        </div>

        {/* 오른쪽: 재난재해 특보 목록 */}
        <div>
          <h3 className="text-gray-700 mb-3">재난재해 특보</h3>
          <div className="bg-gray-50 rounded-lg p-4 h-full min-h-[300px]">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <AlertTriangle className="w-12 h-12 mb-2" />
                <p>현재 발령된 특보가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <span className="text-gray-800">{alert.type}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                    <div className="text-xs text-gray-400">
                      발령 시각: {alert.time}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
