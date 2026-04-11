"use client";

import WidgetRenderer from "@/components/Widgets";

const DEMO_WIDGETS = [
  {
    type: "table" as const,
    title: "Table — Q2 마케팅 예산 배분",
    data: {
      headers: ["구분", "금액", "비율"],
      rows: [
        ["디지털 광고", "3,000만 원", "60%"],
        ["오프라인 행사", "1,500만 원", "30%"],
        ["콘텐츠 제작", "500만 원", "10%"],
      ],
    },
  },
  {
    type: "timeline" as const,
    title: "Timeline — 프로젝트 마일스톤",
    data: {
      items: [
        { date: "4월 1주", event: "기획 확정" },
        { date: "4월 3주", event: "디자인 완료" },
        { date: "5월 2주", event: "개발 완료" },
        { date: "5월 4주", event: "QA 및 출시" },
      ],
    },
  },
  {
    type: "checklist" as const,
    title: "Checklist — 출시 전 점검",
    data: {
      items: [
        "API 키 환경변수 설정",
        "에러 핸들링 테스트",
        "모바일 반응형 확인",
        "성능 최적화 점검",
      ],
    },
  },
  {
    type: "summary_card" as const,
    title: "Summary Card — 핵심 지표",
    data: {
      items: [
        { label: "MAU", value: "12,500명" },
        { label: "전환율", value: "3.2%" },
        { label: "평균 체류시간", value: "4분 30초" },
        { label: "NPS", value: "72점" },
      ],
    },
  },
  {
    type: "chart" as const,
    title: "Chart — 월별 매출 추이",
    data: {
      chart_type: "bar" as const,
      labels: ["1월", "2월", "3월", "4월", "5월"],
      datasets: [
        { name: "매출", values: [1200, 1900, 1500, 2100, 2400] },
        { name: "비용", values: [800, 1100, 900, 1300, 1400] },
      ],
    },
  },
  {
    type: "mindmap" as const,
    title: "Mindmap — 프로젝트 구조",
    data: {
      root: "RealMemo",
      children: [
        {
          label: "프론트엔드",
          children: [
            { label: "Next.js" },
            { label: "Tailwind CSS" },
            { label: "TypeScript" },
          ],
        },
        {
          label: "백엔드",
          children: [
            { label: "API Routes" },
            { label: "Anthropic SDK" },
          ],
        },
        {
          label: "배포",
          children: [
            { label: "Vercel" },
          ],
        },
      ],
    },
  },
  {
    type: "radial_map" as const,
    title: "Radial Map — 효과적인 학습 전략",
    data: {
      root: "효과적인 학습",
      children: [
        {
          label: "입력 방법",
          children: [
            { label: "능동적 읽기" },
            { label: "강의 노트 정리" },
            { label: "멀티미디어 활용" },
          ],
        },
        {
          label: "기억 강화",
          children: [
            { label: "간격 반복" },
            { label: "자기 테스트" },
            { label: "연상 기법" },
          ],
        },
        {
          label: "출력 연습",
          children: [
            { label: "요약 작성" },
            { label: "가르치기" },
          ],
        },
        {
          label: "환경 조성",
          children: [
            { label: "집중 시간 확보" },
            { label: "방해 요소 제거" },
          ],
        },
      ],
    },
  },
  {
    type: "kanban" as const,
    title: "Kanban — 스프린트 보드",
    data: {
      columns: [
        { title: "할 일", cards: ["로그인 페이지 디자인", "API 문서 작성"] },
        { title: "진행 중", cards: ["위젯 시스템 개발", "테스트 코드 작성"] },
        { title: "완료", cards: ["프로젝트 초기 설정", "CI/CD 파이프라인"] },
      ],
    },
  },
  {
    type: "progress" as const,
    title: "Progress — 프로젝트 진행률",
    data: {
      items: [
        { label: "프론트엔드 개발", value: 85, max: 100 },
        { label: "백엔드 API", value: 60, max: 100 },
        { label: "테스트 커버리지", value: 45, max: 100 },
        { label: "문서화", value: 20, max: 100 },
      ],
    },
  },
  {
    type: "quote" as const,
    title: "Quote — 핵심 인사이트",
    data: {
      text: "단순함이야말로 궁극의 정교함이다.",
      author: "레오나르도 다빈치",
      style: "info" as const,
    },
  },
  {
    type: "pros_cons" as const,
    title: "Pros & Cons — 클라우드 vs 온프레미스",
    data: {
      pros: ["초기 비용 절감", "자동 스케일링", "관리 부담 감소", "글로벌 배포 용이"],
      cons: ["장기 비용 증가 가능", "벤더 종속성", "데이터 주권 이슈", "네트워크 의존"],
    },
  },
  {
    type: "accordion" as const,
    title: "Accordion — 자주 묻는 질문",
    data: {
      items: [
        { title: "RealMemo는 무료인가요?", content: "기본 기능은 무료로 제공됩니다. 프리미엄 기능은 추후 유료 플랜으로 제공될 예정입니다." },
        { title: "어떤 AI 모델을 사용하나요?", content: "Anthropic의 Claude Haiku 4.5 모델을 사용하여 빠르고 정확한 텍스트 변환을 제공합니다." },
        { title: "변환된 문서를 내보낼 수 있나요?", content: "현재는 웹에서 확인 가능하며, 노션 등 외부 도구로의 내보내기 기능은 개발 예정입니다." },
      ],
    },
  },
  {
    type: "link_list" as const,
    title: "Link List — 참고 자료",
    data: {
      items: [
        { title: "Next.js 공식 문서", url: "https://nextjs.org/docs", description: "App Router, API Routes 등 핵심 기능 가이드" },
        { title: "Tailwind CSS", url: "https://tailwindcss.com", description: "유틸리티 우선 CSS 프레임워크" },
        { title: "Anthropic API", url: "https://docs.anthropic.com", description: "Claude API 레퍼런스 및 가이드" },
      ],
    },
  },
  {
    type: "gallery" as const,
    title: "Gallery — 팀 소개",
    data: {
      items: [
        { title: "기획", description: "사용자 요구사항 분석 및 기능 설계", tag: "PM" },
        { title: "디자인", description: "UI/UX 설계 및 프로토타입 제작", tag: "Design" },
        { title: "프론트엔드", description: "React 기반 인터랙티브 UI 개발", tag: "Dev" },
        { title: "백엔드", description: "API 설계 및 AI 모델 연동", tag: "Dev" },
        { title: "QA", description: "테스트 자동화 및 품질 관리", tag: "QA" },
        { title: "DevOps", description: "CI/CD 파이프라인 및 인프라 관리", tag: "Ops" },
      ],
    },
  },
  {
    type: "rating" as const,
    title: "Rating — 서비스 평가",
    data: {
      items: [
        { label: "사용 편의성", score: 4.5, max: 5 },
        { label: "변환 정확도", score: 4.0, max: 5 },
        { label: "디자인", score: 4.8, max: 5 },
        { label: "응답 속도", score: 3.5, max: 5 },
      ],
    },
  },
  {
    type: "process" as const,
    title: "Process — 제품 출시 프로세스",
    data: {
      steps: [
        { label: "기획", description: "요구사항 분석 및 기능 정의" },
        { label: "디자인", description: "UI/UX 설계 및 프로토타입" },
        { label: "개발", description: "프론트엔드·백엔드 구현" },
        { label: "테스트", description: "QA 및 버그 수정" },
        { label: "출시", description: "배포 및 모니터링" },
      ],
    },
  },
  {
    type: "metric" as const,
    title: "Metric — 이번 달 핵심 지표",
    data: {
      items: [
        { label: "활성 사용자", value: "12,847명", delta: "+15.3%", trend: "up" as const },
        { label: "전환율", value: "3.8%", delta: "+0.6%p", trend: "up" as const },
        { label: "이탈률", value: "24.1%", delta: "-2.3%p", trend: "down" as const },
        { label: "평균 체류시간", value: "6분 12초", delta: "0%", trend: "neutral" as const },
      ],
    },
  },
  {
    type: "swot" as const,
    title: "SWOT — RealMemo 서비스 분석",
    data: {
      strengths: ["AI 기반 자동 구조화", "직관적 UI/UX", "빠른 변환 속도"],
      weaknesses: ["제한된 위젯 커스터마이징", "오프라인 미지원", "다국어 미지원"],
      opportunities: ["노트 앱 시장 성장", "AI 도구 수요 증가", "교육 시장 진출 가능"],
      threats: ["Notion/Obsidian 등 강력한 경쟁자", "AI API 비용 상승", "개인정보 우려"],
    },
  },
  {
    type: "comparison" as const,
    title: "Comparison — 노트 앱 기능 비교",
    data: {
      columns: ["RealMemo", "Notion", "Obsidian"],
      features: [
        { name: "AI 자동 정리", values: [true, true, false] },
        { name: "오프라인 지원", values: [false, false, true] },
        { name: "실시간 협업", values: [false, true, false] },
        { name: "마크다운 지원", values: [true, true, true] },
        { name: "위젯 시각화", values: [true, false, false] },
        { name: "무료 사용", values: [true, "부분 무료", true] },
      ],
    },
  },
  {
    type: "poll" as const,
    title: "Poll — 선호하는 메모 형식",
    data: {
      items: [
        { label: "마크다운", votes: 342 },
        { label: "자유 형식", votes: 256 },
        { label: "템플릿 기반", votes: 189 },
        { label: "음성 메모", votes: 87 },
        { label: "손글씨", votes: 45 },
      ],
    },
  },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/[0.06] bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-6 py-3 flex items-center justify-between">
          <a href="/" className="text-base font-semibold text-gray-900 tracking-tight hover:opacity-70 transition-opacity">
            <span className="text-indigo-600">Real</span>Memo
            <span className="ml-2 text-xs font-normal text-gray-400">위젯 데모</span>
          </a>
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            메인으로
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-sm text-gray-400 mb-10">
          지원하는 모든 위젯 타입의 렌더링 결과입니다.
        </p>
        <WidgetRenderer widgets={DEMO_WIDGETS} />
      </main>
    </div>
  );
}
