# PaperPass — 3-pass 논문 읽기 노트

> 막히는 개념은 적어두고 다음으로 넘어가는, 초보 연구자를 위한 3-pass 논문 읽기 노트

신호처리·광통신 연구실 학부연구생이 IEEE Xplore, Google Scholar, arXiv 논문을 S. Keshav의 **3-pass 읽기법**으로 읽고 기록하도록 돕는 웹앱입니다. *인공지능입문* 바이브 코딩 실습 과제로 만들었습니다.

## 주요 기능 (MVP)
1. **논문 등록과 3-pass 진행 관리**: 출처 배지, 진행 바, 상태·태그 필터, 검색, 중복 제목 경고
2. **단계별 가이드 노트와 전제 개념 기록**
   - 1·2·3차 탭마다 신호처리 분야에 맞춘 가이드 질문이 있어요.
   - 1초 뒤 자동 저장돼요.
   - 모르는 개념은 이름과 위치만 빠르게 적어 두면 돼요.
   - **개념 노트**에서 내 말로 정리하고, 같은 개념은 하나로 합칠 수 있어요.
3. **인쇄용 3차 워크시트**: A4 2쪽 분량이고, 손글씨 여백과 미해결 개념 체크리스트가 들어 있어요.

데이터는 브라우저 `localStorage`에만 저장돼요. 로그인과 서버는 없어요.

## 문서
- [PRD](docs/PRD.md): 제품 요구사항 정의서
- [디자인](docs/design/README.md): Google Stitch로 만든 화면 디자인
- [CLAUDE.md](CLAUDE.md): Claude Code 작업 규칙

## 실행
```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 단위 테스트
npm run build    # 배포용 빌드 (dist/)
```

## 배포 (Vercel)
1. vercel.com에서 **Import Project**를 누르고 이 GitHub 저장소를 고르세요.
2. 프레임워크는 Vite로 자동 감지되니 그대로 **Deploy**를 누르면 돼요.
3. 그다음부터는 `main`에 push하면 자동으로 배포돼요. 페이지 경로는 `vercel.json`이 처리해요.

## 만든 과정
기획(Gemini, PRD 7단계) → 디자인(Google Stitch) → 개발(Claude Code) → 배포(GitHub + Vercel)
