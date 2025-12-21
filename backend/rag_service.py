# rag_service.py

import os
from dotenv import load_dotenv
from typing import List, Dict, Any, Union

from langchain_openai import AzureOpenAIEmbeddings, AzureChatOpenAI
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import (
    RunnablePassthrough,
    RunnableParallel,
    RunnableLambda,
)
from langchain_core.output_parsers import StrOutputParser
from langchain_core.documents import Document

# ---------- 환경 설정 ----------
load_dotenv()

CHROMA_DIR = "./chroma_store"
COLLECTION_NAME = "documents"
LLM_MODEL = "gpt-5-mini"
EMBEDDING_MODEL = "text-embedding-3-small"

# 전역 객체들 (초기에는 None)
llm: Union[AzureChatOpenAI, None] = None
embeddings_model: Union[AzureOpenAIEmbeddings, None] = None
chroma_db: Union[Chroma, None] = None
retriever: Any = None
rag_chain_enhanced: Any = None

# ---------- 모델 & Chroma 초기화 ----------
try:
    llm = AzureChatOpenAI(deployment_name=LLM_MODEL, temperature=1)
    embeddings_model = AzureOpenAIEmbeddings(
        model=EMBEDDING_MODEL,
        dimensions=1024,
    )

    chroma_db = Chroma(
        collection_name=COLLECTION_NAME,
        persist_directory=CHROMA_DIR,
        embedding_function=embeddings_model,
    )

    retriever = chroma_db.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 5, "fetch_k": 20, "lambda_mult": 0.3},
    )

    print(f"✅ RAG 시스템 초기화 성공. 문서 수: {chroma_db._collection.count()}")

except Exception as e:
    print(f"❌ RAG 시스템 초기화 실패: {e}")
    print("오류: 환경 변수, Azure OpenAI 설정 또는 ChromaDB 경로를 확인하세요.")


# ---------- RAG 체인 구성 함수들 ----------

def parse_rephrased_queries(text: str) -> List[str]:
    """LLM의 출력에서 검색 쿼리만 추출하여 리스트로 만듭니다."""
    queries: List[str] = []
    for line in text.split("\n"):
        line = line.strip()
        if line.startswith("Query"):
            parts = line.split(":", 1)
            if len(parts) == 2:
                q = parts[1].strip()
                if q:
                    queries.append(q)
    return queries


def format_docs(docs: List[Document]) -> str:
    """검색된 문서 리스트를 문자열로 포맷팅합니다."""
    return "\n\n".join(doc.page_content for doc in docs)


async def multi_query_retriever(queries: List[str]) -> List[Document]:
    """여러 검색 쿼리를 비동기로 실행하고, 결과를 통합하여 중복 없이 반환."""
    if not retriever:
        return []

    if not isinstance(queries, list):
        queries = [queries]

    all_docs: List[Document] = []
    for q in queries:
        docs = await retriever.ainvoke(q)
        all_docs.extend(docs)

    # (page_content + metadata) 기준 중복 제거
    unique_docs_map: Dict[Any, Document] = {
        (doc.page_content, tuple(sorted(doc.metadata.items()))): doc
        for doc in all_docs
    }
    return list(unique_docs_map.values())


# ---------- 프롬프트 & 체인 정의 (llm/retriever가 있을 때만) ----------

if llm and retriever:
    # 1. 쿼리 변형
    rephrase_template = """
    당신은 사용자의 질문을 가장 잘 대변할 수 있는 최대 3개의 독립적인 검색 쿼리를 생성하는 어시스턴트입니다.
    질문의 핵심 주제를 유지하고, 검색 엔진에서 찾을 수 있는 최적의 키워드 형태의 쿼리를 생성하세요.
    당신의 소규모 온실을 운영하고 있으며 온실은 유리다.

    [질문]: {question}

    [출력 형식]:
    Query 1: <첫 번째 검색 쿼리>
    Query 2: <두 번째 검색 쿼리>
    Query 3: <세 번째 검색 쿼리> (필요한 경우에만)
    """
    rephrase_prompt = ChatPromptTemplate.from_template(rephrase_template)
    rephrase_chain = rephrase_prompt | llm | StrOutputParser() | parse_rephrased_queries

    # 2. 재순위
    rerank_template = """
    당신은 농업 기술 비서입니다. 주어진 '질문'과 검색된 '문서 목록'을 바탕으로,
    질문에 답변하기 위해 가장 핵심적이고 유용한 정보를 포함하는 문서 3개(만)를 골라
    그 내용만 출력하세요. 문서의 출처나 번호는 포함하지 않습니다.

    [질문]: {question}

    [문서 목록]:
    {context}

    [출력 형식]:
    선별된 문서 내용 1
    ---
    선별된 문서 내용 2
    ---
    선별된 문서 내용 3
    """
    rerank_prompt = ChatPromptTemplate.from_template(rerank_template)

    # 3. 최종 답변
    final_answer_template = """
   [지침]
- 당신은 딸기 재배 가이드를 전문으로 하는 농업 기술 비서입니다.
- 답변은 간단하고 핵심적으로 요약해서 말할 것.
- 불필요한 설명은 제거하고, 실천 지침도 짧게 제시할 것.

[질문]: {question}

[재순위 컨텍스트]:
{context}

[최종 답변 형식]
1. 핵심 요약: (1~2줄)
2. 필요한 조치: (핵심 사항만 2~3줄)
3. 주의사항: (필요한 경우만 간단히)

[답변]
"""
    final_answer_prompt = ChatPromptTemplate.from_template(final_answer_template)

    rag_chain_enhanced = (
        # 1) 질문 → {question, queries}
        RunnableParallel(
            queries=rephrase_chain,
            question=RunnablePassthrough(),
        )
        # 2) multi-query 검색 → context 문자열 생성
        | RunnableParallel(
            context=(
                RunnableLambda(lambda x: x["queries"])
                | RunnableLambda(multi_query_retriever)
                | RunnableLambda(format_docs)
            ),
            question=RunnableLambda(lambda x: x["question"]),
        )
        # 3) 재순위
        | RunnableParallel(
            context=rerank_prompt | llm | StrOutputParser(),
            question=RunnableLambda(lambda x: x["question"]),
        )
        # 4) 최종 답변
        | final_answer_prompt
        | llm
        | StrOutputParser()
    )
else:
    print("⚠ RAG 체인 미생성: llm 또는 retriever 초기화 실패")


# ---------- 외부에서 쓸 함수 ----------

async def run_rag(question: str) -> str:
    """main.py에서 호출하는 RAG 실행 함수."""
    if not rag_chain_enhanced:
        raise RuntimeError("RAG 체인이 초기화되지 않았습니다. 서버 로그를 확인하세요.")
    result = await rag_chain_enhanced.ainvoke(question)


    return result.strip()
