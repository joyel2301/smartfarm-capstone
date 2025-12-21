import os
import time
import json
from glob import glob
from typing import Iterable, List

import chromadb
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_openai import AzureOpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# --- 환경 설정 ---
load_dotenv()

DOCUMENTS_DIR = "./documents"  # PDF 파일 폴더
EMBEDDING_MODEL = "text-embedding-3-small"
CHROMA_DIR = "./chroma_store"
COLLECTION_NAME = "documents"

# --- 임베딩 모델 초기화 ---
try:
  embeddings_model = AzureOpenAIEmbeddings(model=EMBEDDING_MODEL, dimensions=1024)
except Exception as e:
  print(f"임베딩 모델 초기화 실패: {e}")
  raise SystemExit(1)


def batch_iter(items: Iterable, batch_size: int):
  batch = []
  for item in items:
    batch.append(item)
    if len(batch) >= batch_size:
      yield batch
      batch = []
  if batch:
    yield batch


# --- 1. PDF 로드 및 청크 분할 ---
all_pdf_files = glob(os.path.join(DOCUMENTS_DIR, "*.pdf"))
if not all_pdf_files:
  print(f"오류: '{DOCUMENTS_DIR}' 폴더에 PDF 파일이 없습니다.")
  raise SystemExit(1)

splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
  encoding_name="cl100k_base",
  chunk_size=500,
  chunk_overlap=100,
)

texts: List[str] = []
metas: List[dict] = []
pages = 0

print(f"총 {len(all_pdf_files)}개 문서 로드 및 분할 시작")
for pdf_path in all_pdf_files:
  print(f"- 처리 중: {os.path.basename(pdf_path)}")
  docs = PyPDFLoader(pdf_path).load()
  pages += len(docs)
  chunks = splitter.split_documents(docs)
  for ch in chunks:
    texts.append(ch.page_content)
    metas.append(dict(ch.metadata) if ch.metadata else {})

print(f"분할 완료: 원본 페이지 {pages}, 청크 {len(texts)}")

# --- 2. 임베딩 계산 (rate limit 대비 소량 배치) ---
print("임베딩 계산 시작")
embeddings: List[List[float]] = []
for batch in batch_iter(texts, 16):
  while True:
    try:
      embeddings.extend(embeddings_model.embed_documents(batch))
      break
    except Exception as e:
      msg = str(e)
      if "RateLimit" in msg or "429" in msg:
        print("Rate limit 감지, 10초 대기 후 재시도...")
        time.sleep(10)
        continue
      raise
print("임베딩 계산 완료")

# --- 3. Chroma DB 저장 ---
print("Chroma 저장 시작")
client = chromadb.PersistentClient(path=CHROMA_DIR)
collection = client.get_or_create_collection(
  name=COLLECTION_NAME,
  metadata={"hnsw:space": "cosine"},
)

ids = [str(i + 1) for i in range(len(texts))]
collection.add(
  ids=ids,
  documents=texts,
  metadatas=metas,
  embeddings=embeddings,
)
print(f"Chroma 저장 완료: {len(texts)}개 청크가 컬렉션 '{COLLECTION_NAME}'에 추가되었습니다.")
