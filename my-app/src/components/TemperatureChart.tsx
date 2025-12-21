import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Thermometer } from 'lucide-react';

// 시간별 온도 데이터 생성 (예시)
const generateTemperatureData = () => {
  const hours = [];
  const baseTemp = 22;
  for (let i = 0; i < 24; i++) {
    const variation = Math.sin(i / 24 * Math.PI * 2) * 5 + Math.random() * 2;
    hours.push({
      time: `${i.toString().padStart(2, '0')}:00`,
      temperature: Number((baseTemp + variation).toFixed(1)),
    });
  }
  return hours;
};

export function TemperatureChart() {
  const [data, setData] = useState(generateTemperatureData());
  const [currentTemp, setCurrentTemp] = useState(23.5);
  
  const minTemp = 18; // 최저 기준 온도
  const maxTemp = 28; // 최고 기준 온도
  
  // 현재 온도 시뮬레이션 (실제로는 센서에서 받아옴)
  useEffect(() => {
    const interval = setInterval(() => {
      const newTemp = 22 + Math.random() * 6 - 3;
      setCurrentTemp(Number(newTemp.toFixed(1)));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const getTempStatus = () => {
    if (currentTemp < minTemp) return { status: '낮음', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (currentTemp > maxTemp) return { status: '높음', color: 'text-red-600', bg: 'bg-red-100' };
    return { status: '정상', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const tempStatus = getTempStatus();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-3 rounded-lg">
            <Thermometer className="w-6 h-6 text-green-700" />
          </div>
          <div>
            <h2 className="text-green-800">온실 온도 모니터링</h2>
            <p className="text-green-600 text-sm">실시간 온도 추이 및 기준 범위</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600 mb-1">현재 온도</div>
          <div className="flex items-center gap-2">
            <span className="text-3xl text-gray-800">{currentTemp}°C</span>
            <span className={`px-3 py-1 rounded-full text-sm ${tempStatus.bg} ${tempStatus.color}`}>
              {tempStatus.status}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-700">최고 기준: {maxTemp}°C</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-gray-700">최저 기준: {minTemp}°C</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-700">현재 온도</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="time" 
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="#6b7280"
            domain={[15, 32]}
            tick={{ fontSize: 12 }}
            label={{ value: '온도 (°C)', angle: -90, position: 'insideLeft' }}
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
          <ReferenceLine 
            y={maxTemp} 
            stroke="#ef4444" 
            strokeDasharray="5 5" 
            label={{ value: '최고 기준', position: 'right', fill: '#ef4444' }}
          />
          <ReferenceLine 
            y={minTemp} 
            stroke="#3b82f6" 
            strokeDasharray="5 5"
            label={{ value: '최저 기준', position: 'right', fill: '#3b82f6' }}
          />
          <Line 
            type="monotone" 
            dataKey="temperature" 
            stroke="#10b981" 
            strokeWidth={2}
            name="현재 온도"
            dot={{ fill: '#10b981', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
