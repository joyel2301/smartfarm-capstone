import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, MapPin, Beaker } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  listPestControls,
  createPestControl,
  deletePestControl,
  PestControlRow,
} from '../api/pestControlApi';

const AREAS = ['A동', 'B동', 'C동', 'D동'];
const PESTICIDES = [
  { name: '살균제A', color: '#ef4444' },
  { name: '살충제B', color: '#3b82f6' },
  { name: '생장조절제C', color: '#10b981' },
  { name: '제초제D', color: '#f59e0b' },
];

type FormState = {
  date: string;
  area: string;
  pesticide: string;
  amount: string;
  memo: string;
};

export function PestControlManager() {
  const [records, setRecords] = useState<PestControlRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<FormState>({
    date: new Date().toISOString().split('T')[0],
    area: AREAS[0],
    pesticide: PESTICIDES[0].name,
    amount: '',
    memo: '',
  });

  const loadRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listPestControls();
      // 날짜 최신순 정렬
      const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
      setRecords(sorted);
    } catch (err) {
      setError((err as Error).message || '데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = Number(formData.amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      alert('사용량을 0보다 크게 입력해 주세요.');
      return;
    }

    try {
      await createPestControl({
        date: formData.date,
        area: formData.area,
        pesticide: formData.pesticide,
        amount: amountNum,
        memo: formData.memo,
      });
      await loadRecords();
      setFormData({
        date: new Date().toISOString().split('T')[0],
        area: AREAS[0],
        pesticide: PESTICIDES[0].name,
        amount: '',
        memo: '',
      });
    } catch (err) {
      setError((err as Error).message || '저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = confirm('이 기록을 삭제하시겠습니까?');
    if (!ok) return;
    try {
      await deletePestControl(id);
      await loadRecords();
    } catch (err) {
      setError((err as Error).message || '삭제에 실패했습니다.');
    }
  };

  // 그래프 데이터 생성
  const getChartData = () => {
    const pesticideData: { [key: string]: { [pesticide: string]: number } } = {};

    records.forEach((record) => {
      if (!pesticideData[record.date]) {
        pesticideData[record.date] = {};
      }
      if (!pesticideData[record.date][record.pesticide]) {
        pesticideData[record.date][record.pesticide] = 0;
      }
      pesticideData[record.date][record.pesticide] += record.amount;
    });

    return Object.keys(pesticideData)
      .sort()
      .map((date) => ({
        date,
        ...pesticideData[date],
      }));
  };

  const chartData = getChartData();

  return (
    <div className="">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-100 p-3 rounded-lg">
          <Beaker className="w-6 h-6 text-purple-700" />
        </div>
        <div>
          <h2 className="text-purple-800">방제 기록 관리</h2>
          <p className="text-purple-600 text-sm">방제 투입량과 구역별 기록을 관리합니다.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 왼쪽: 입력 폼 */}
        <div className="lg:col-span-1">
          <h3 className="text-gray-700 mb-4">방제 기록 작성</h3>
          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg">
            {/* 날짜 */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                날짜
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* 구역 선택 */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                구역
              </label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* 농약 선택 */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                <Beaker className="w-4 h-4 inline mr-1" />
                약제
              </label>
              <select
                value={formData.pesticide}
                onChange={(e) => setFormData({ ...formData, pesticide: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {PESTICIDES.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 사용량 */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">사용량(L)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* 메모 */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">메모</label>
              <textarea
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                placeholder="메모를 입력하세요..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
              {loading ? '저장 중...' : '기록 추가'}
            </button>
          </form>
        </div>

        {/* 오른쪽: 목록 & 그래프 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 기록 테이블 */}
          <div>
            <h3 className="text-gray-700 mb-4">방제 기록</h3>
            <div className="overflow-x-auto bg-gray-50 rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm text-gray-700">날짜</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">구역</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">약제</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">사용량(L)</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">메모</th>
                    <th className="px-4 py-3 text-left text-sm text-gray-700">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        아직 방제 기록이 없습니다. 새로운 기록을 추가해 주세요.
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-gray-100 hover:bg-white transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-800">{record.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{record.area}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            {record.pesticide}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">{record.amount}L</td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                          {record.memo || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 그래프 */}
          <div>
            <h3 className="text-gray-700 mb-4">약제 사용량 추이</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {chartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Beaker className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>데이터가 없습니다</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }}
                      label={{ value: '날짜', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      tick={{ fontSize: 12 }}
                      label={{ value: '사용량(L)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend />
                    {PESTICIDES.map((pesticide) => (
                      <Bar key={pesticide.name} dataKey={pesticide.name} fill={pesticide.color} name={pesticide.name} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
