import type { PassNo, PaperStatus, Source } from './types';

export interface GuideQuestion {
  id: string;
  text: string;
  hint: string;
  placeholder: string;
}

export interface PassGuide {
  pass: PassNo;
  label: string;
  short: string;
  time: string;
  scope: string;
  questions: GuideQuestion[];
}

/** Guide questions from docs/PRD.md §3 (tailored to signal processing). */
export const PASS_GUIDES: Record<PassNo, PassGuide> = {
  1: {
    pass: 1,
    label: '1차: 훑기',
    short: '훑기',
    time: '5~10분',
    scope: '제목, 초록, 서론, 그림·표, 결론만 읽기',
    questions: [
      {
        id: 'q1',
        text: '논문 유형은?',
        hint: '새 기법 제안 / 성능 분석 / 실험 시연 / 서베이 중 하나를 고르고 근거를 적으세요.',
        placeholder: '예: 새 기법 제안 — 초록에서 "we propose a BiLSTM-based equalizer"라고 밝힘',
      },
      {
        id: 'q2',
        text: '이 논문이 푸는 문제를 한 문장으로 쓰면?',
        hint: '"무엇이 문제라서, 무엇을 개선한다" 형태로 써 보세요.',
        placeholder: '예: 112-Gb/s PAM4 IM/DD 링크의 비선형 왜곡을 Volterra보다 낮은 복잡도로 보상한다',
      },
      {
        id: 'q3',
        text: '시스템 구성은?',
        hint: '그림 1을 보고 송신기 → 채널 → 수신기 순서로 적으세요.',
        placeholder: '예: PAM4 매핑 → DAC → DML → 10 km SSMF → PIN-PD → ADC → 제안 등화기 → 판정',
      },
      {
        id: 'q4',
        text: '저자가 주장하는 주요 기여 3가지는?',
        hint: '서론 마지막 문단의 "Our contributions are..."를 찾아보세요.',
        placeholder: '1) ...\n2) ...\n3) ...',
      },
      {
        id: 'q5',
        text: '계속 읽을 가치가 있나? 이유는?',
        hint: '"아니오"를 고르고 1차 완료를 누르면 이 논문은 보류로 바뀝니다.',
        placeholder: '예: 내 연구(딥러닝 비선형 등화)와 직접 관련 — 비교 대상으로 쓸 수 있음',
      },
    ],
  },
  2: {
    pass: 2,
    label: '2차: 이해',
    short: '이해',
    time: '약 1시간',
    scope: '본문 전체, 수식 유도는 건너뛰어도 됨',
    questions: [
      {
        id: 'q1',
        text: '제안 기법을 내 말로 설명하면?',
        hint: '블록도 순서대로, 각 블록이 무엇을 입력받아 무엇을 내보내는지 적으세요.',
        placeholder: '예: 수신 심볼 16개를 슬라이딩 윈도로 받아 3층 BiLSTM이 ISI와 비선형 왜곡을 함께 보상…',
      },
      {
        id: 'q2',
        text: '비교 대상(baseline)은 무엇인가?',
        hint: '저자가 "기존 방법"으로 내세운 기법들을 적으세요.',
        placeholder: '예: 51-tap FFE, 15-tap DFE, 2차 Volterra 등화기',
      },
      {
        id: 'q3',
        text: '성능 지표는?',
        hint: 'BER, SNR, Q-factor, EVM, 전송용량, 복잡도 등 — 수치와 함께 적으세요.',
        placeholder: '예: HD-FEC 한계(3.8×10⁻³) 기준 수신 감도 2.1 dB 개선, 파라미터 수 55.7% 감소',
      },
      {
        id: 'q4',
        text: '실험·시뮬레이션 조건은?',
        hint: '변조 방식, 데이터율, 전송 거리, 대역폭, 데이터셋을 적으세요.',
        placeholder: '예: 56 GBaud PAM4, 10 km SSMF, 1550 nm DFB, 25 GHz PIN-PD, 학습 2^18 심볼',
      },
      {
        id: 'q5',
        text: '가장 중요한 그림 1개와, 그 그림이 보여주는 것은?',
        hint: '그림 번호와 축(x, y)을 먼저 적고, 그림이 증명하는 주장을 한 문장으로 쓰세요.',
        placeholder: '예: Fig. 4 BER vs. ROP — 제안 기법이 Volterra 대비 2.1 dB 낮은 ROP에서 HD-FEC 통과',
      },
    ],
  },
  3: {
    pass: 3,
    label: '3차: 깊이',
    short: '깊이',
    time: '수 시간',
    scope: '출력해서 읽기 권장 · 세부 내용과 재현 가능성',
    questions: [
      {
        id: 'q1',
        text: '저자가 둔 가정과 한계는?',
        hint: '본문에 명시되지 않았지만 결과가 성립하려면 필요한 조건도 찾아보세요.',
        placeholder: '예: 채널이 시간에 따라 변하지 않는다고 가정, 실시간 구현 시 지연은 다루지 않음',
      },
      {
        id: 'q2',
        text: '이 결과를 재현하려면 무엇이 필요한가?',
        hint: '파라미터, 코드, 장비, 데이터셋을 구체적으로 적으세요.',
        placeholder: '예: AWG 샘플링 속도, 오실로스코프 대역폭, 은닉 노드 수 H=32, 학습률…',
      },
      {
        id: 'q3',
        text: '내 연구와 어떻게 연결되는가?',
        hint: '그대로 쓸 수 있는 것, 바꿔 볼 것, 비교 대상으로 쓸 것을 나눠 보세요.',
        placeholder: '예: BiLSTM 대신 Transformer를 써서 지연 문제를 줄일 수 있는지 실험해 볼 것',
      },
      {
        id: 'q4',
        text: '다음에 읽을 참고문헌은?',
        hint: '참고문헌 번호와 읽으려는 이유를 함께 적으세요.',
        placeholder: '예: [14] Volterra 복잡도 분석 — 비교 수식 확인용',
      },
    ],
  },
};

export const PASSES: PassNo[] = [1, 2, 3];

export const MAX_ANSWER = 2000;

export const SOURCE_META: Record<Source, { label: string; badge: string }> = {
  ieee: { label: 'IEEE Xplore', badge: 'bg-src-ieee-bg text-src-ieee' },
  arxiv: { label: 'arXiv', badge: 'bg-src-arxiv-bg text-src-arxiv' },
  scholar: { label: 'Google Scholar', badge: 'bg-src-scholar-bg text-src-scholar' },
  other: { label: '기타', badge: 'bg-src-other-bg text-src-other' },
};

export const STATUS_LABEL: Record<PaperStatus, string> = {
  toread: '읽을 것',
  pass1: '1차 완료',
  pass2: '2차 완료',
  pass3: '3차 완료',
  onhold: '보류',
};
