export type PestControlRow = {
  id: string;
  date: string;
  area: string;
  pesticide: string;
  amount: number;
  memo: string | null;
};

import { getAuthHeader } from "../lib/supabaseClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const baseHeaders = { "Content-Type": "application/json" };

export async function listPestControls(): Promise<PestControlRow[]> {
  const headers = { ...(await getAuthHeader()) };
  const res = await fetch(`${BACKEND_URL}/api/pest-controls`, { headers });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`방제 기록 조회 실패: ${res.status} ${message}`);
  }
  return res.json();
}

export async function createPestControl(payload: Omit<PestControlRow, 'id'>): Promise<PestControlRow> {
  const headers = { ...baseHeaders, ...(await getAuthHeader()) };
  const res = await fetch(`${BACKEND_URL}/api/pest-controls`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`방제 기록 저장 실패: ${res.status} ${message}`);
  }

  const data = (await res.json()) as PestControlRow;
  return data;
}

export async function deletePestControl(id: string): Promise<void> {
  const headers = { ...baseHeaders, ...(await getAuthHeader()) };
  const res = await fetch(`${BACKEND_URL}/api/pest-controls/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`방제 기록 삭제 실패: ${res.status} ${message}`);
  }
}
