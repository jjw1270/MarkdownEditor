# 스펙 — 문서 내비게이션(뒤로/앞으로)

> 상태: **구현 완료(2026-07-20)** · 대상: `web/app.js`, `web/index.html`, `web/style.css` (C# 변경 없음)
> 검증: 링크 이동→뒤로→앞으로 사이클, 버튼 활성/비활성 상태 전환을 실제 실행 스크린샷으로 확인.

## 1. 요약
링크 클릭으로 새 탭에 이동한 뒤 원래 문서로 쉽게 돌아오도록, **방문한 문서 사이를 뒤로/앞으로 이동**하는 기능. VS Code "뒤로 가기"와 같은 방문 히스토리 모델.

## 2. 확정된 결정
| 항목 | 결정 |
|---|---|
| 히스토리 범위 | **모든 탭 방문 기록** (링크 이동 + 수동 탭 클릭 + 파일 열기 모두) |
| 방향 | **뒤로 + 앞으로** 모두 제공 |
| 조작 | **툴바 `←` `→` 버튼 + 단축키 `Alt+←` / `Alt+→`** |
| 구현 위치 | **전부 웹(JS)**, C#·배포물 변경 없음 |

## 3. 동작 모델 (방문 히스토리)

상태 변수 (JS 모듈 스코프):
```
navStack : number[]   // 방문 순서대로 쌓인 tabId 목록
navIndex : number     // 현재 위치 (navStack의 인덱스), 초기 -1
isNavigating : bool   // 뒤로/앞으로 수행 중 재기록 방지 플래그
NAV_LIMIT = 50        // 스택 상한
```

### 3.1 기록(navigate) — `recordVisit(tabId)`
탭이 활성화될 때 호출. 단, `isNavigating === true`면 **기록하지 않음**.
1. `navStack[navIndex] === tabId` 이면(직전과 동일) 아무것도 안 함.
2. `navIndex` 뒤쪽(forward 구간)을 잘라냄: `navStack.length = navIndex + 1`.
3. `navStack.push(tabId)`, `navIndex = navStack.length - 1`.
4. 상한 초과 시 맨 앞 제거하고 `navIndex--`.

### 3.2 뒤로 — `goBack()`
1. `navIndex`에서 왼쪽으로, **현재 존재하는 탭**을 만날 때까지 인덱스를 줄임(닫힌 탭 항목은 건너뜀).
2. 대상이 있으면 `isNavigating=true` → `focusTab(id)` → `isNavigating=false`.
3. 대상이 없으면 무동작(버튼 비활성 상태).

### 3.3 앞으로 — `goForward()`
`goBack`의 반대 방향(오른쪽)으로 동일 로직.

### 3.4 탭 닫기 — `closeTab` 훅
- 닫힌 tabId를 `navStack`에서 **모두 제거**하고, 제거로 인해 앞당겨진 만큼 `navIndex` 보정.
- 보정 후 `navIndex`가 스택 밖이면 마지막 유효 위치로 클램프.
- (대안: 제거 대신 goBack/goForward에서 "존재하지 않는 탭 skip"만으로도 동작하나, 스택 비대화를 막기 위해 제거 방식 채택.)

### 3.5 버튼 활성/비활성 — `updateNavButtons()`
- 뒤로 가능: `navIndex` 왼쪽에 **현존 탭** 항목이 하나라도 있으면 활성.
- 앞으로 가능: 오른쪽에 현존 탭 항목이 있으면 활성.
- 매 `focusTab` / `closeTab` / 기록 후 호출.

## 4. UI
- 위치: 툴바 **가장 왼쪽**(appName 앞 또는 뒤)에 `←` `→` 버튼 배치.
- 비활성 시 흐리게(`opacity` 낮춤) + `disabled` 처리로 클릭 무시.
- 툴팁: `뒤로 (Alt+←)`, `앞으로 (Alt+→)`.
- 스타일은 기존 `#bar button` 규칙 재사용, 아이콘 전용 최소 폭.

## 5. 단축키
`document` keydown에서:
- `Alt+ArrowLeft` → `goBack()` (기본동작 `preventDefault`)
- `Alt+ArrowRight` → `goForward()`
- 기존 `Ctrl+S/O/E/W`와 충돌 없음.
- (옵션·후순위) 마우스 4/5번 버튼: `mouseup`의 `e.button===3/4`.

## 6. 코드 터치포인트 (app.js)
| 지점 | 변경 |
|---|---|
| 상태 선언부 | `navStack/navIndex/isNavigating/NAV_LIMIT` 추가 |
| `focusTab(id)` | 끝에서 `if(!isNavigating) recordVisit(id)` 호출, `updateNavButtons()` |
| `openOrFocus` | 신규 탭도 결국 `focusTab`을 타므로 별도 기록 불필요 |
| `closeTab` | 스택 정리 로직 + `updateNavButtons()` |
| 신규 함수 | `recordVisit / goBack / goForward / updateNavButtons` |
| 버튼/단축키 | `index.html`에 `←→` 버튼, 이벤트 바인딩, keydown 분기 |

## 7. 엣지 케이스
- 이미 열린 문서 링크(dedup) → `focusTab` 경유로 정상 기록.
- "새 문서"(저장 전, path=null) 탭도 tabId로 추적되어 정상 동작.
- 뒤로 이동 후 새 링크/열기 → forward 구간 자동 삭제(3.1-2).
- 탭 1개 또는 첫 문서뿐 → 뒤로·앞으로 모두 비활성.
- 뒤로 대상 탭이 이미 닫힘 → 스킵 후 그 다음 유효 탭으로.

## 8. 비목표
- 앱 재시작 후 히스토리 영속화(세션 한정).
- 브라우저식 URL 히스토리.

## 9. 수용 기준 (검증 시나리오)
1. A 열기 → A의 링크로 B → 뒤로: **A로 복귀**, 앞으로: **B로 복귀**.
2. A→B→C 방문 후 뒤로 2번: **A**, 앞으로 1번: **B**.
3. B에서 뒤로(→A) 후 A의 다른 링크로 D: **forward 비었고**(C로 못 감), 뒤로: A.
4. 히스토리 중간 탭을 닫아도 뒤로/앞으로가 닫힌 탭을 건너뛰고 정상 이동.
5. 이동 대상 없을 때 버튼 비활성 + 단축키 무동작.
6. 기존 기능(탭 전환/닫기/저장/테마/링크 열기) 회귀 없음.

## 10. 후속 확장 (2026-07-20 구현 완료)
초기 비목표/후순위 항목을 추가 구현하고 실제 실행으로 검증함. 모두 `web/` 3개 파일 내 처리, C# 변경 없음.

| 기능 | 구현 요약 | 검증 |
|---|---|---|
| **탭별 스크롤 위치 복원** | 탭에 `scroll` 필드 추가. `saveScroll()`로 떠날 때 저장, `applyMode`(미리보기)에서 복원. `focusTab`/`setMode`에 훅 | guide 탭을 열었다 돌아와도 long.md가 "문제 해결" 위치 유지 |
| **마우스 4·5번 버튼** | `window` `mouseup`에서 `e.button===3→goBack`, `4→goForward` | XBUTTON1 전송 시 long→guide 이동 확인 |
| **문서 내 헤딩 앵커** | `assignHeadingIds()`가 헤딩을 GitHub식 slug로 id 부여, 미리보기 클릭 핸들러가 `#앵커`를 `scrollToAnchor`로 처리 | 목차의 "문제 해결" 클릭 시 해당 섹션으로 스크롤 |
