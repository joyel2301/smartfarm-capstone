import React, { useState } from 'react';
import { upsertGrowthWeekly } from '../api/growthApi';

export default function GrowthForm({ onSaved }) {
  const [form, setForm] = useState({
    week: '',
    height: '',
    leaves: '',
    diameter: '',
    plant_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');

    try {
      await upsertGrowthWeekly({
        week: Number(form.week),
        height: Number(form.height),
        leaves: Number(form.leaves),
        diameter: form.diameter ? Number(form.diameter) : undefined,
        plantCode: form.plant_code,
      });

      setForm({
        week: '',
        height: '',
        leaves: '',
        diameter: '',
        plant_code: '',
      });

      if (onSaved) onSaved();
    } catch (e) {
      setErr(e?.message || '저장에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="growth-form" onSubmit={onSubmit}>
      <h3 className="growth-form__title">생육 데이터 추가</h3>

      <div className="growth-form__field">
        <label className="growth-form__label" htmlFor="week">
          주차(week)
        </label>
        <input
          id="week"
          name="week"
          type="number"
          min="0"
          step="1"
          placeholder="예: 3"
          value={form.week}
          onChange={onChange}
          className="growth-form__input"
          required
        />
      </div>

      <div className="growth-form__field">
        <label className="growth-form__label" htmlFor="plant_code">
          식물 코드(plant_code)
        </label>
        <input
          id="plant_code"
          name="plant_code"
          type="text"
          placeholder="예: A-1, P001"
          value={form.plant_code}
          onChange={onChange}
          className="growth-form__input"
          required
        />
      </div>

      <div className="growth-form__field">
        <label className="growth-form__label" htmlFor="height">
          초장(cm)
        </label>
        <input
          id="height"
          name="height"
          type="number"
          step="0.1"
          placeholder="예: 15.2"
          value={form.height}
          onChange={onChange}
          className="growth-form__input"
          required
        />
      </div>

      <div className="growth-form__field">
        <label className="growth-form__label" htmlFor="leaves">
          엽수(개)
        </label>
        <input
          id="leaves"
          name="leaves"
          type="number"
          step="1"
          placeholder="예: 12"
          value={form.leaves}
          onChange={onChange}
          className="growth-form__input"
          required
        />
      </div>

      <div className="growth-form__field">
        <label className="growth-form__label" htmlFor="diameter">
          관부직경(mm)
        </label>
        <input
          id="diameter"
          name="diameter"
          type="number"
          step="0.1"
          placeholder="예: 3.6"
          value={form.diameter}
          onChange={onChange}
          className="growth-form__input"
        />
      </div>

      <button
        type="submit"
        className="growth-form__button"
        disabled={loading}
      >
        {loading ? '저장 중…' : '추가/업데이트'}
      </button>

      {err && <div className="growth-form__error">{err}</div>}
    </form>
  );
}
