import React from 'react';
import StrawberryGrowthChart from './StrawberryGrowthChart';

export default function GrowthDataPanel({ data = [], loading, err }) {
  if (loading) {
    return <div style={{ color: '#6b7280' }}>불러오는 중…</div>;
  }

  if (err) {
    return <div style={{ color: '#b91c1c' }}>{err}</div>;
  }

  return <StrawberryGrowthChart data={data} />;
}