import React, { useMemo, useState } from 'react';
import { upsertGrowthWeekly } from '../api/growthApi';

export default function GrowthDataForm({ onSaved }) {
  const [form, setForm] = useState({ week: '', height: '', leaves: '', diameter: '' });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const canSubmit = useMemo(() => {
    const w = Number(form.week);
    const h = Number(form.height);
    const l = Number(form.leaves);
    const d = form.diameter === '' ? NaN : Number(form.diameter);
    const diameterOk = form.diameter === '' || isFinite(d);
    return Number.isInteger(w) && w >= 0 && isFinite(h) && isFinite(l) && diameterOk;
  }, [form]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setErr('');
    try {
      await upsertGrowthWeekly({
        week: Number(form.week),
        height: Number(form.height),
        leaves: Number(form.leaves),
        diameter: form.diameter === '' ? undefined : Number(form.diameter),
      });
      setForm({ week: '', height: '', leaves: '', diameter: '' });
      if (typeof onSaved === 'function') {
        try { onSaved(); } catch {}
      }
    } catch (e) {
      setErr(e?.message || '저장에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ height: '100%' }}>
      <div style={{ display: 'grid', gap: 10 }}>
        <label style={{ display: 'grid', gap: 4 }}>
          <span style={{ fontSize: 13, color: '#374151' }}>주차(week)</span>
          <input
            name="week"
            type="number"
            min="0"
            step="1"
            value={form.week}
            onChange={onChange}
            style={inputStyle}
            placeholder="예: 3"
            required
          />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span style={{ fontSize: 13, color: '#374151' }}>초장(cm)</span>
          <input
            name="height"
            type="number"
            step="0.1"
            value={form.height}
            onChange={onChange}
            style={inputStyle}
            placeholder="예: 15.2"
            required
          />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span style={{ fontSize: 13, color: '#374151' }}>엽수(개)</span>
          <input
            name="leaves"
            type="number"
            step="1"
            value={form.leaves}
            onChange={onChange}
            style={inputStyle}
            placeholder="예: 12"
            required
          />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span style={{ fontSize: 13, color: '#374151' }}>관부직경(mm)</span>
          <input
            name="diameter"
            type="number"
            step="0.1"
            value={form.diameter}
            onChange={onChange}
            style={inputStyle}
            placeholder="예: 3.6"
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            background: submitting ? '#e5e7eb' : '#111827',
            color: submitting ? '#6b7280' : 'white',
            cursor: (!canSubmit || submitting) ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? '저장 중…' : '추가/업데이트'}
        </button>

        {err ? <div style={{ color: '#b91c1c' }}>{err}</div> : null}
      </div>
    </form>
  );
}

const inputStyle = {
  padding: '8px 10px',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  outline: 'none',
};

