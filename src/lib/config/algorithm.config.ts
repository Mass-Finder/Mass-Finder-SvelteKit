/**
 * Simulated Annealing Algorithm Configuration
 *
 * 알고리즘 파라미터 및 화학적 상수 정의
 */

/**
 * Simulated Annealing 알고리즘 기본 설정
 */
export const SIMULATED_ANNEALING_CONFIG = {
  /**
   * 초기 온도
   * - 높을수록 초기에 더 많은 탐색 수행
   * - 권장 범위: 5000 ~ 20000
   */
  INITIAL_TEMPERATURE: 10000,

  /**
   * 절대 온도 (최소 온도)
   * - 알고리즘 종료 조건
   * - 너무 높으면 조기 종료, 너무 낮으면 계산 시간 증가
   */
  ABSOLUTE_TEMPERATURE: 0.00001,

  /**
   * 냉각률 (Cooling Rate)
   * - 매 반복마다 온도에 곱해지는 값
   * - 0.95 ~ 0.99 사이 권장
   * - 0.99: 느린 냉각 (정확도 ↑, 시간 ↑)
   * - 0.95: 빠른 냉각 (정확도 ↓, 시간 ↓)
   */
  COOLING_RATE: 0.99,

  /**
   * SA 반복 횟수 (각 온도에서)
   * - 기본값: 100
   * - 높을수록 정확도 향상, 계산 시간 증가
   */
  DEFAULT_ITERATIONS: 100,

  /**
   * 저장할 상위 솔루션 개수
   */
  TOP_SOLUTIONS_COUNT: 100,
} as const;

/**
 * 화학적 상수
 */
export const CHEMICAL_CONSTANTS = {
  /**
   * 물 분자 무게 (H2O)
   * - Monoisotopic mass
   */
  WATER_WEIGHT: 18.01056,

  /**
   * Formylation 무게 (CO group)
   * - Formyl group: -CHO
   */
  FORMYLATION_WEIGHT: 27.99,
} as const;

/**
 * 참조 서열 사용 확률 설정
 */
export const REFERENCE_SEQUENCE_CONFIG = {
  /**
   * neighborSolution에서 참조 서열 사용 확률
   * - 0.9 = 90% 확률로 참조 서열에서 아미노산 선택
   * - 0.1 = 10% 확률로 랜덤 선택
   */
  USE_PROBABILITY: 0.9,
} as const;

/**
 * 조합 생성 제한 설정
 */
export const COMBINATION_LIMITS = {
  /**
   * 최대 조합 개수
   * - 메모리 부족 방지
   */
  MAX_COMBINATIONS: 10_000,

  /**
   * 전체 탐색 가능한 최대 페어 수
   * - 이 값을 초과하면 샘플링 전략 사용
   */
  MAX_PAIRS_FOR_FULL_SEARCH: 20,

  /**
   * Crosslinking 최대 사이즈
   * - 한 조합에 포함될 수 있는 최대 crosslinking 쌍 개수
   */
  MAX_CROSSLINKING_SIZE: 5,

  /**
   * 로그 출력 제한
   * - 조합 생성 시 처음 N개만 로그 출력
   */
  LOG_LIMIT: 50,
} as const;

/**
 * 성능 최적화 설정
 */
export const PERFORMANCE_CONFIG = {
  /**
   * 메모이제이션 캐시 최대 크기
   * - Map 크기 제한으로 메모리 관리
   */
  MEMOIZATION_MAX_SIZE: 1000,
} as const;

/**
 * 알고리즘 모드별 설정
 */
export const SA_MODES = {
  FAST: {
    label: 'Fast',
    initialTemperature: 5000,
    coolingRate: 0.95,
    iterations: 50,
  },
  NORMAL: {
    label: 'Normal',
    initialTemperature: 10000,
    coolingRate: 0.99,
    iterations: 100,
  },
  ACCURATE: {
    label: 'Accurate',
    initialTemperature: 15000,
    coolingRate: 0.995,
    iterations: 150,
  },
} as const;

export type SAMode = keyof typeof SA_MODES;
