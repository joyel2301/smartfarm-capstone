import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from 'recharts';
import { Thermometer, Wind, Calendar, TrendingUp } from 'lucide-react';
import { fetchEnvironmentData } from '../features/weather/api/environmentApi';

type EnvironmentRow = {
  time?: string;
  soilTemp: number | null;
  soilHum?: number | null;
  co2?: number | null;
  ah?: number | null;
  radiation?: number | null;
};

type ChartRow = {
  time: string;
  temperature: number;
  heating: number;
  cooling: number;
};

export function EnvironmentControl() {
  const [hvacData, setHvacData] = useState<ChartRow[]>([]);
  const [currentTemp, setCurrentTemp] = useState(23.5);
  const [heatingSetpoints, setHeatingSetpoints] = useState({ min: 20, max: 26 });
  const [tempError, setTempError] = useState('');

  const updateSetpoint = (type: 'min' | 'max', value: number) => {
    setHeatingSetpoints((prev) => {
      const next = { ...prev, [type]: value };
      if (type === 'min' && value > prev.max) {
        next.max = value;
      }
      if (type === 'max' && value < prev.min) {
        next.min = value;
      }
      return next;
    });
  };

  // 환기창 데이터 (동서남북 + 천창)
  const [ventilation, setVentilation] = useState([
    { direction: '동쪽', position: 'east', openLevel: 45, status: 'active' },
    { direction: '서쪽', position: 'west', openLevel: 30, status: 'active' },
    { direction: '남쪽', position: 'south', openLevel: 60, status: 'active' },
    { direction: '북쪽', position: 'north', openLevel: 20, status: 'inactive' },
    { direction: '천창', position: 'top', openLevel: 75, status: 'active' },
  ]);

  // 수확 정보
  const [harvestInfo] = useState({
    plantingDate: '2025-10-15',
    harvestDate: '2026-01-20',
    expectedYield: 1250, // kg
    currentProgress: 65, // %
  });

  // 온실 온도 & 그래프 데이터: Desktop1과 동일한 환경 데이터 API 연결
  const loadEnvironment = async (): Promise<void> => {
    try {
      const data = (await fetchEnvironmentData(240)) as EnvironmentRow[];
      const latest = data[data.length - 1];
      if (latest && typeof latest.soilTemp === 'number') {
        setCurrentTemp(Number(latest.soilTemp.toFixed(1)));
      }
      const chartRows = data
        .filter((row): row is EnvironmentRow & { soilTemp: number } => typeof row.soilTemp === 'number')
        .map((row) => {
          const temp = Number(row.soilTemp.toFixed(1));
          const heating = Math.max(0, heatingSetpoints.min - temp);
          const cooling = Math.max(0, temp - heatingSetpoints.max);
          const timeLabel = row.time
            ? new Date(row.time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
            : '';
          return {
            time: timeLabel,
            temperature: temp,
            heating: Number(heating.toFixed(1)),
            cooling: Number(cooling.toFixed(1)),
          };
        });
      setHvacData(chartRows);
      setTempError('');
    } catch (error) {
      setTempError('온실 온도 불러오기 실패');
    }
  };

  useEffect(() => {
    loadEnvironment();
    const interval = setInterval(loadEnvironment, 60 * 1000);
    return () => clearInterval(interval);
  }, [heatingSetpoints.min, heatingSetpoints.max]);

  // 수확까지 남은 일수 계산
  const getDaysUntilHarvest = () => {
    const today = new Date();
    const harvest = new Date(harvestInfo.harvestDate);
    const diffTime = harvest.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysUntilHarvest();

  // 방향별 위치 스타일
  const getPositionStyle = (position: string) => {
    const positions: { [key: string]: string } = {
      north: 'top-0 left-1/2 -translate-x-1/2',
      south: 'bottom-0 left-1/2 -translate-x-1/2',
      east: 'right-0 top-1/2 -translate-y-1/2',
      west: 'left-0 top-1/2 -translate-y-1/2',
      top: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    };
    return positions[position] || '';
  };

  const getStatusColor = (openLevel: number) => {
    if (openLevel >= 70) return 'text-green-600';
    if (openLevel >= 40) return 'text-yellow-600';
    return 'text-blue-600';
  };

  return (
    <div className="space-y-6">

      <div className="style border-b pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-3 rounded-lg">
            <Wind className="w-6 h-6 text-indigo-700" />
          </div>
          <div>
            <h2 className="text-indigo-800">환경 제어 현황</h2>
            <p className="text-indigo-600 text-sm">냉난방 · 환기 · 수확 관리</p>
          </div>
        </div>
      </div>
      {/* 냉난방 그래프 */}
      <div className="">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Thermometer className="w-5 h-5 text-red-500" />
            <h3 className="text-gray-800">냉난방 제어 현황</h3>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-600">현재 온도</div>
              <div className="text-2xl text-gray-800">{currentTemp}°C</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <span className="px-2 py-1 rounded-full bg-red-50 border border-red-100 text-red-600">
                최저 {heatingSetpoints.min}°C
              </span>
              <span className="px-2 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600">
                최고 {heatingSetpoints.max}°C
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <label className="flex items-center gap-2">
                <span className="text-gray-600">설정 최저</span>
                <input
                  type="number"
                  value={heatingSetpoints.min}
                  onChange={(e) => updateSetpoint('min', Number(e.target.value))}
                  className="w-16 border border-gray-200 rounded px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-red-300"
                />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-gray-600">설정 최고</span>
                <input
                  type="number"
                  value={heatingSetpoints.max}
                  onChange={(e) => updateSetpoint('max', Number(e.target.value))}
                  className="w-16 border border-gray-200 rounded px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-orange-300"
                />
              </label>
            </div>
            {tempError && (
              <div className="text-xs text-red-500">{tempError}</div>
            )}
          </div>
        </div>

        <div className="mb-4 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-700">현재 온도</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-700">난방 출력</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-700">냉방 출력</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={hvacData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorHeating" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorCooling" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <ReferenceLine
              y={heatingSetpoints.min}
              stroke="#ef4444"
              strokeDasharray="6 6"
              label={{ value: `설정 최저 ${heatingSetpoints.min}°C`, position: 'insideTopLeft', fill: '#ef4444', fontSize: 12 }}
            />
            <ReferenceLine
              y={heatingSetpoints.max}
              stroke="#f59e0b"
              strokeDasharray="6 6"
              label={{ value: `설정 최고 ${heatingSetpoints.max}°C`, position: 'insideTopLeft', fill: '#b45309', fontSize: 12, dy: 16 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="heating" 
              stroke="#ef4444" 
              fillOpacity={1}
              fill="url(#colorHeating)"
              name="난방 출력 (kW)"
            />
            <Area 
              type="monotone" 
              dataKey="cooling" 
              stroke="#3b82f6" 
              fillOpacity={1}
              fill="url(#colorCooling)"
              name="냉방 출력 (kW)"
            />
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="#10b981" 
              strokeWidth={3}
              name="온도 (°C)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 환기창 시각화 */}
      <div className="">
        <div className="flex items-center gap-3 mb-6">
          <Wind className="w-5 h-5 text-cyan-500" />
          <h3 className="text-gray-800">환기창 개폐 현황</h3>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 온실 평면도 */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-8">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* 온실 중앙 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3/5 h-3/5 bg-gradient-to-br from-green-100 to-green-200 rounded-lg border-4 border-green-300 shadow-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-green-700 text-sm mb-1">온실 내부</div>
                    <div className="text-2xl text-green-800">{currentTemp}°C</div>
                  </div>
                </div>
              </div>

              {/* 각 방향 환기창 표시 */}
              {ventilation.map((vent) => (
                <div
                  key={vent.position}
                  className={`absolute ${getPositionStyle(vent.position)}`}
                >
                  <div className="relative group">
                    {/* 환기창 레이블 및 개폐도 */}
                    <div className={`bg-white rounded-lg shadow-lg p-3 border-2 ${
                      vent.status === 'active' ? 'border-cyan-400' : 'border-gray-300'
                    } hover:scale-110 transition-transform cursor-pointer`}>
                      <div className="text-center min-w-[80px]">
                        <div className="text-xs text-gray-600 mb-1">{vent.direction}</div>
                        <div className={`text-lg ${getStatusColor(vent.openLevel)}`}>
                          {vent.openLevel}%
                        </div>
                        {vent.status === 'active' && (
                          <div className="w-2 h-2 bg-cyan-400 rounded-full mx-auto mt-1 animate-pulse"></div>
                        )}
                      </div>
                    </div>
                    
                    {/* 방향 표시 화살표 */}
                    {vent.position !== 'top' && (
                      <div className={`absolute ${
                        vent.position === 'north' ? 'top-full left-1/2 -translate-x-1/2 mt-1' :
                        vent.position === 'south' ? 'bottom-full left-1/2 -translate-x-1/2 mb-1' :
                        vent.position === 'east' ? 'left-full top-1/2 -translate-y-1/2 ml-1' :
                        'right-full top-1/2 -translate-y-1/2 mr-1'
                      }`}>
                        <div className={`w-8 h-1 ${
                          vent.status === 'active' ? 'bg-cyan-400' : 'bg-gray-300'
                        }`}></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 상세 정보 패널 */}
          <div className="space-y-3">
            <h4 className="text-sm text-gray-600 mb-4">개폐 상태 상세</h4>
            {ventilation.map((vent, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-800">{vent.direction} 환기창</span>
                    {vent.status === 'active' && (
                      <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs rounded">
                        작동중
                      </span>
                    )}
                  </div>
                  <span className={`text-lg ${getStatusColor(vent.openLevel)}`}>
                    {vent.openLevel}%
                  </span>
                </div>
                
                {/* 진행 바 */}
                <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      vent.openLevel >= 70 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                      vent.openLevel >= 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                      'bg-gradient-to-r from-blue-400 to-blue-500'
                    }`}
                    style={{ width: `${vent.openLevel}%` }}
                  >
                    <div className="w-full h-full bg-gradient-to-r from-transparent to-white opacity-30"></div>
                  </div>
                </div>
                
                {/* 상태 설명 */}
                <div className="mt-2 text-xs text-gray-500">
                  {vent.openLevel >= 70 ? '충분한 환기' :
                   vent.openLevel >= 40 ? '적정 환기' :
                   '제한적 환기'}
                </div>
              </div>
            ))}
            
            {/* 평균 환기율 */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-200 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">평균 환기율</span>
                <span className="text-xl text-cyan-700">
                  {Math.round(ventilation.reduce((sum, v) => sum + v.openLevel, 0) / ventilation.length)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 수확 카운트다운 */}
      <div className="style border-b pb-4 mb-4  ">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5 text-orange-500" />
          <h3 className="text-gray-800">수확 예정</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 카운트다운 */}
          <div className="md:col-span-1 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 text-center">
            <div className="text-sm text-gray-600 mb-2">수확까지</div>
            <div className="text-5xl text-orange-600 mb-2">{daysRemaining}</div>
            <div className="text-gray-700 mb-4">일 남음</div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>파종일: {harvestInfo.plantingDate}</div>
              <div>수확일: {harvestInfo.harvestDate}</div>
            </div>
          </div>

          {/* 진행도 */}
          <div className="md:col-span-2 space-y-6">
            {/* 성장 진행도 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-700">성장 진행도</span>
                <span className="text-lg text-green-600">{harvestInfo.currentProgress}%</span>
              </div>
              <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                  style={{ width: `${harvestInfo.currentProgress}%` }}
                >
                  <span className="text-white text-sm drop-shadow">🍓</span>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* 예상 수확량 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">예상 수확량</span>
                </div>
                <span className="text-3xl text-green-700">{harvestInfo.expectedYield}kg</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">1등급</div>
                  <div className="text-green-700">{Math.round(harvestInfo.expectedYield * 0.6)}kg</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">2등급</div>
                  <div className="text-yellow-600">{Math.round(harvestInfo.expectedYield * 0.3)}kg</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">3등급</div>
                  <div className="text-orange-600">{Math.round(harvestInfo.expectedYield * 0.1)}kg</div>
                </div>
              </div>
            </div>

            {/* 생육 단계 */}
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    harvestInfo.currentProgress >= 20 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-sm text-gray-600">발아</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    harvestInfo.currentProgress >= 40 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-sm text-gray-600">생장</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    harvestInfo.currentProgress >= 60 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-sm text-gray-600">개화</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    harvestInfo.currentProgress >= 80 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-sm text-gray-600">결실</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    harvestInfo.currentProgress >= 100 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-sm text-gray-600">수확</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
