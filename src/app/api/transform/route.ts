import OpenAI from "openai";

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `당신은 텍스트를 구조화된 문서로 변환하는 전문가입니다.
사용자가 입력한 텍스트를 분석하여 다음 JSON 형식으로 응답하세요:

{
  "markdown": "정리된 마크다운 문서 (헤딩, 리스트, 강조, 테이블 등 활용)",
  "diagrams": ["Mermaid.js 다이어그램 코드 배열 (필요한 경우에만)"],
  "widgets": [
    {
      "type": "table" | "timeline" | "checklist" | "summary_card",
      "title": "위젯 제목",
      "data": {}
    }
  ]
}

규칙:
1. 마크다운은 반드시 한국어로, 내용을 논리적으로 재구성하여 작성
2. 원본 의미를 보존하되 가독성을 크게 개선
3. 다이어그램은 프로세스, 관계, 구조가 있을 때만 생성
4. Mermaid 코드는 반드시 유효한 문법이어야 함
5. 위젯은 데이터가 테이블/타임라인/체크리스트로 표현하기 적합할 때만 생성
6. 반드시 유효한 JSON만 반환 (마크다운 코드블록 없이)`;

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return Response.json({ error: "텍스트를 입력해주세요." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const completion = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return Response.json(
        { error: "AI 응답을 받지 못했습니다." },
        { status: 500 }
      );
    }

    const result = JSON.parse(content);
    return Response.json(result);
  } catch (error) {
    console.error("Transform error:", error);
    return Response.json(
      { error: "변환 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
