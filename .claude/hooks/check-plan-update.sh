#!/bin/bash
# PLAN-CURRENT.md 진행 상황 업데이트 알림 훅
# Stop 이벤트에서 실행됨

PROJECT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
PLAN_CURRENT="$PROJECT_DIR/PLAN-CURRENT.md"

if [[ ! -f "$PLAN_CURRENT" ]]; then
  exit 0
fi

if grep -q "진행 중인 항목 없음" "$PLAN_CURRENT" 2>/dev/null; then
  exit 0
fi

REMAINING=$(grep -c '^\- \[ \]' "$PLAN_CURRENT" 2>/dev/null || echo 0)
COMPLETED=$(grep -c '^\- \[x\]' "$PLAN_CURRENT" 2>/dev/null || echo 0)

if [[ "$REMAINING" -gt 0 || "$COMPLETED" -gt 0 ]]; then
  echo ""
  echo "┌─────────────────────────────────────────────────────┐"
  echo "│  PLAN-CURRENT.md 진행 상황                          │"
  echo "│  완료: $COMPLETED / 남은 항목: $REMAINING"
  echo "│                                                     │"
  echo "│  완료된 항목이 있다면 PLAN-CURRENT.md를             │"
  echo "│  업데이트하세요.                                    │"
  echo "└─────────────────────────────────────────────────────┘"
fi
