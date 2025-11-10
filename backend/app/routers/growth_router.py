from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.services.db import get_db
import csv, io

router = APIRouter(prefix="/growth", tags=["growth"])


@router.get("/weekly", response_model=dict)
def list_weekly(db: Session = Depends(get_db)):
  rows = db.execute(text(
      """
      select time, height, leaf_count
      from public.growth_weekly
      order by time
      """
  )).mappings().all()
  return {"items": [dict(r) for r in rows]}


@router.post("/weekly/csv")
async def upload_weekly_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
  """
  CSV 업로드: time,height,leaf_count  예) 1,5.2,9
  """
  text_data = (await file.read()).decode("utf-8-sig")
  reader = csv.DictReader(io.StringIO(text_data))
  required = {"time", "height", "leaf_count"}
  if not required.issubset(set(h.strip() for h in (reader.fieldnames or []))):
    raise HTTPException(400, "CSV 헤더는 time,height,leaf_count 이어야 합니다")

  rows = []
  for r in reader:
    rows.append({
      "time": int(r["time"]),
      "height": float(r["height"]),
      "leaf_count": float(r["leaf_count"]),
    })
  if not rows:
    return {"inserted_or_updated": 0}

  values = ", ".join(f"(:time{i}, :height{i}, :leaf_count{i})" for i in range(len(rows)))
  params = {}
  for i, r in enumerate(rows):
    params.update({
      f"time{i}": r["time"],
      f"height{i}": r["height"],
      f"leaf_count{i}": r["leaf_count"],
    })
  db.execute(text(f"""
    insert into public.growth_weekly(time, height, leaf_count)
    values {values}
    on conflict (time) do update
      set height = excluded.height,
          leaf_count = excluded.leaf_count
  """), params)
  db.commit()
  return {"status": "ok", "inserted_or_updated": len(rows)}

