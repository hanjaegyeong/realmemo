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
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-gray-900 tracking-tight hover:opacity-80 transition-opacity">
            <span className="text-indigo-600">Real</span>Memo
            <span className="ml-2 text-sm font-normal text-gray-400">위젯 데모</span>
          </a>
          <a href="/" className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors">
            메인으로
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm text-gray-500 mb-8">
          지원하는 모든 위젯 타입의 렌더링 결과입니다. 각 위젯의 인터랙션(정렬, 체크, 클릭 등)을 직접 사용해보세요.
        </p>
        <WidgetRenderer widgets={DEMO_WIDGETS} />
      </main>
    </div>
  );
}
