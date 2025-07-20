# CLAUDE.md - Mass Finder Project Context

## 프로젝트 개요
Mass Finder는 생화학 연구자를 위한 분자량 분석 웹 애플리케이션입니다. 분자량과 아미노산 시퀀스 간의 상호 변환을 제공하는 전문 도구로, 시뮬레이티드 어닐링 알고리즘과 웹 워커를 활용한 고성능 계산을 지원합니다.

## 핵심 기능
- **MTS (Mass to Sequence)**: 감지된 분자량으로부터 가능한 아미노산 시퀀스 예측
- **STM (Sequence to Mass)**: RNA 시퀀스를 아미노산 시퀀스로 변환하고 분자량 계산
- **Chemical Drawing**: ChemDoodle를 이용한 화학 구조 그리기 및 분자량 계산
- **Manual**: 사용법 안내 페이지

## 기술 스택
- **Frontend**: SvelteKit + TypeScript + Bootstrap 5
- **Chemistry**: ChemDoodle Web Components
- **Algorithm**: 시뮬레이티드 어닐링, 웹 워커 비동기 처리
- **Build**: Vite, 정적 사이트 생성

## 프로젝트 구조
```
src/
├── lib/
│   ├── components/     # UI 컴포넌트 (Selector, Table 등)
│   ├── helper/         # 비즈니스 로직 (MassFinderHelper, StmHelper)
│   ├── model/          # 데이터 모델 (AminoModel, Atom)
│   ├── stores/         # 상태 관리
│   └── workers/        # 웹 워커 (mass_finder.worker.ts)
├── routes/             # 페이지 라우팅
├── type/               # TypeScript 타입 정의
└── app.html           # 메인 HTML 템플릿
```

## 현재 상태 (약 80% 완성)
### ✅ 완전 구현된 기능
- MTS/STM 계산 엔진
- ChemDoodle 화학 구조 그리기
- 웹 워커 비동기 처리
- 기본 UI 컴포넌트들

### ⚠️ 개선 필요 영역
- Manual 페이지 콘텐츠 부족
- 테스트 코드 0% 커버리지
- 성능 최적화 필요
- 모바일 UI/UX 개선

## 최근 주요 업데이트 (feat/input_origin 브랜치)
- RNA 시퀀스 기반 초기값 설정 기능 구현
- MTS 페이지 UI 개선 및 검증 로직 강화
- 시뮬레이티드 어닐링 알고리즘 고도화

## 개발 명령어
```bash
npm run dev        # 개발 서버 실행
npm run build      # 프로덕션 빌드
npm run preview    # 빌드 미리보기
```

## 알려진 이슈
- 시뮬레이티드 어닐링의 확률적 특성으로 인한 결과 변동
- 매우 큰 분자량에 대한 계산 시간 증가
- 모바일 환경에서의 입력 불편함

## 즉시 실행 가능한 개선사항
1. Manual 페이지 사용법 가이드 작성
2. 입력 검증 및 오류 메시지 개선
3. 계산 결과 내보내기 기능 (CSV/JSON)
4. 성능 최적화 및 테스트 코드 추가

## 중요 파일 및 함수
- `src/lib/helper/mass_finder_helper.ts`: MTS 계산 로직
- `src/lib/helper/stm_helper.ts`: STM 변환 로직
- `src/lib/workers/mass_finder.worker.ts`: 웹 워커 계산
- `src/routes/mts/+page.svelte`: MTS 페이지 컴포넌트
- `src/routes/stm/+page.svelte`: STM 페이지 컴포넌트

## 사용자 대상
- 생화학 연구자
- 분자생물학 연구자
- 화학 분석 전문가
- 학술 연구 목적의 사용자

## 성공 지표
- 정확한 분자량 계산 결과
- 빠른 계산 처리 속도
- 사용자 친화적인 인터페이스
- 다양한 화학적 변형 지원

---
*이 문서는 Claude Code가 프로젝트를 이해하고 효과적으로 작업할 수 있도록 돕는 컨텍스트 정보입니다.*