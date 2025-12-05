import { supabase } from '../../../lib/supabaseClient';

export async function fetchGrowthWeekly() {
  if (!supabase) throw new Error('Supabase not configured: set REACT_APP_SUPABASE_URL/ANON_KEY and restart dev server');
  const { data, error } = await supabase
    .from('growth_weekly')
    .select('*')
    .order('time', { ascending: true });
  if (error) throw error;
  return (data || []).map((r) => ({
    week: r.time,
    height: Number(r.height),
    leaves: Number(r.leaf_count),
    diameter: r.diameter != null
      ? Number(r.diameter)
      : (r.stem != null ? Number(r.stem) : undefined),
  }));
}

export async function upsertGrowthWeekly({ week, height, leaves, diameter }) {
  if (!supabase) throw new Error('Supabase not configured: set REACT_APP_SUPABASE_URL/ANON_KEY and restart dev server');
  const payload = {
    time: Number(week),
    height: Number(height),
    leaf_count: Number(leaves),
  };
  if (diameter !== undefined && diameter !== null && diameter !== "") {
    const d = Number(diameter);
    if (Number.isFinite(d)) payload.diameter = d;
  }
  const { error } = await supabase.from('growth_weekly').upsert(payload).select();
  if (error) throw error;
}
