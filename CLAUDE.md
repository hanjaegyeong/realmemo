# RealMemo — 텍스트를 진짜 메모로

텍스트를 입력하면 AI가 마크다운으로 정리하고, 다이어그램과 인터랙티브 위젯으로 시각화해주는 웹앱.

## 핵심 목표

날것의 텍스트(회의록, 아이디어, 강의 노트, 기획안 등)를 **구조화된 문서 + 시각화**로 자동 변환.
- 마크다운: 헤딩, 리스트, 테이블 등으로 내용을 논리적으로 재구성
- 위젯: 테이블, 타임라인, 체크리스트, 요약카드로 인터랙티브 표현

## 기술 스택

- **프론트엔드**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **AI API**: Anthropic Claude Haiku 4.5
- **마크다운 렌더링**: react-markdown + remark-gfm
- **다이어그램**: Mermaid.js
- **배포**: Vercel (https://realmemo-dug7r7n4f-hanjaegyeongs-projects.vercel.app/)

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx          — 루트 레이아웃
│   ├── page.tsx            — 메인 페이지 (입력 + 결과)
│   ├── globals.css         — 글로벌 스타일
│   └── api/transform/
│       └── route.ts        — AI 변환 API 엔드포인트
└── components/
    ├── ResultView.tsx      — 마크다운 + 다이어그램 + 위젯 통합 렌더러
    ├── MermaidDiagram.tsx  — Mermaid.js 다이어그램 컴포넌트
    └── Widgets.tsx         — 인터랙티브 위젯 (테이블/타임라인/체크리스트/요약카드)
```

## AI 응답 스키마

API(`/api/transform`)는 GPT-4o-mini에게 아래 JSON 구조를 요청한다:

```json
{
  "markdown": "정리된 마크다운 문서",
  "diagrams": ["Mermaid.js 코드 배열"],
  "widgets": [
    {
      "type": "table | timeline | checklist | summary_card",
      "title": "위젯 제목",
      "data": {}
    }
  ]
}
```

## 위젯 타입별 data 구조

- **table**: `{ headers: string[], rows: string[][] }`
- **timeline**: `{ items: { date: string, event: string }[] }`
- **checklist**: `{ items: string[] }`
- **summary_card**: `{ items: { label: string, value: string }[] }`

## 문서 동기화

- 위젯 타입이 추가/변경/삭제되면 `src/app/demo/page.tsx`의 `DEMO_WIDGETS` 배열을 반드시 함께 갱신한다.

## 코딩 컨벤션

- 한국어 UI, 영어 코드
- Client Component에는 반드시 `"use client"` 선언
- API 키는 서버 사이드에서만 사용 (환경변수 `ANTHROPIC_API_KEY`)
- Tailwind CSS로 스타일링, 인라인 스타일 금지
- 컬러 테마: indigo 계열 primary

## 디자인 원칙

- 깔끔하고 미니멀한 UI
- 입력과 결과를 명확히 구분
- 로딩 상태 항상 표시
- 에러 메시지는 한국어로 친절하게

---

## 플랜 원칙

- 각 항목은 제목·헤딩 없이 `-`로 한 줄만 작성한다. 부가 정보 없음.
- 구체적 구현 계획은 `/start-phase`로 시작한 뒤 PLAN-CURRENT.md에서 진행.
- 완료 내용은 PLAN-DONE.md에서 관리한다.
- "무엇을 구현할지"가 아니라 생각해야 할 문제를 적는다.
- CLAUDE.md가 프로젝트의 단일 진실 소스.

## 플랜 관리 흐름

플랜 파일 3종:
- `PLAN.md` — 마스터 백로그 (전체 구현 계획)
- `PLAN-CURRENT.md` — 현재 진행 중인 항목 (체크리스트 + 진행 로그)
- `PLAN-DONE.md` — 완료된 항목 아카이브

```
/start-phase
  │  PLAN.md에서 최상단 항목 추출
  │  → PLAN-CURRENT.md에 체크리스트 생성
  │  → PLAN.md에 (진행 중) 표시
  │
  ▼  구현 작업 진행
  │
  │  [자동] Stop 훅 — 매 턴 종료 시
  │  파일 변경 감지 → PLAN-CURRENT.md 업데이트 알림
  │
  ▼  모든 체크리스트 완료
  │
/complete-phase
     PLAN-CURRENT.md → PLAN-DONE.md에 아카이빙
     → PLAN.md에 [x] 체크 + 완료 날짜
     → PLAN-CURRENT.md 초기화
```

### 훅

| 이벤트 | 대상 | 동작 |
|--------|------|------|
| `PostToolUse` | `Edit\|Write` | CLAUDE.md 동기화 알림 |
| `Stop` | 전체 | PLAN-CURRENT.md 진행 상황 업데이트 알림 |
