/**
 * Scoring and Evaluation Configuration
 *
 * 솔루션 평가 및 점수 계산 가중치 설정
 */

/**
 * 솔루션 평가 가중치
 *
 * 질량 정확도와 서열 유사도의 중요도를 조정
 */
export const SCORING_WEIGHTS = {
  /**
   * 질량 정확도 가중치
   * - 검출된 질량과 계산된 질량의 차이
   * - 기본값: 0.8 (80%)
   */
  MASS_ACCURACY: 0.8,

  /**
   * 서열 유사도 가중치
   * - 참조 서열과의 유사도
   * - 기본값: 0.2 (20%)
   */
  SEQUENCE_SIMILARITY: 0.2,
} as const;

/**
 * Simulated Annealing Evaluate 함수용 가중치
 *
 * evaluate() 함수 내부에서 사용 (참조 서열이 있을 때)
 */
export const SA_EVALUATE_WEIGHTS = {
  /**
   * 정규화된 질량 차이 가중치
   * - 기본값: 0.95 (95%)
   */
  NORMALIZED_MASS_DIFF: 0.95,

  /**
   * 서열 차이 가중치
   * - 기본값: 0.05 (5%)
   */
  SEQUENCE_DIFF: 0.05,
} as const;

/**
 * 솔루션 정렬 가중치
 *
 * sortAmino() 함수에서 최종 정렬 시 사용
 */
export const SORT_WEIGHTS = {
  /**
   * 질량 정확도 가중치
   * - 기본값: 0.9 (90%)
   */
  MASS_ACCURACY: 0.9,

  /**
   * 서열 유사도 가중치
   * - 기본값: 0.1 (10%)
   */
  SEQUENCE_SIMILARITY: 0.1,
} as const;

/**
 * 서열 유사도 평가 임계값
 */
export const SIMILARITY_THRESHOLDS = {
  /**
   * 높은 유사도 (초록 배지)
   * - 70% 이상
   */
  HIGH: 70,

  /**
   * 중간 유사도 (노랑 배지)
   * - 40% ~ 70%
   */
  MEDIUM: 40,

  /**
   * 낮은 유사도 (빨강 배지)
   * - 40% 미만
   */
  // LOW는 MEDIUM 미만으로 자동 판정
} as const;

/**
 * 검증: 가중치 합이 1.0인지 확인
 */
const validateWeights = () => {
  const scoringSum = SCORING_WEIGHTS.MASS_ACCURACY + SCORING_WEIGHTS.SEQUENCE_SIMILARITY;
  const saEvaluateSum = SA_EVALUATE_WEIGHTS.NORMALIZED_MASS_DIFF + SA_EVALUATE_WEIGHTS.SEQUENCE_DIFF;
  const sortSum = SORT_WEIGHTS.MASS_ACCURACY + SORT_WEIGHTS.SEQUENCE_SIMILARITY;

  if (Math.abs(scoringSum - 1.0) > 0.001) {
    console.warn(`SCORING_WEIGHTS sum is ${scoringSum}, expected 1.0`);
  }
  if (Math.abs(saEvaluateSum - 1.0) > 0.001) {
    console.warn(`SA_EVALUATE_WEIGHTS sum is ${saEvaluateSum}, expected 1.0`);
  }
  if (Math.abs(sortSum - 1.0) > 0.001) {
    console.warn(`SORT_WEIGHTS sum is ${sortSum}, expected 1.0`);
  }
};

// 개발 환경에서 검증 실행
if (import.meta.env.MODE === 'development') {
  validateWeights();
}
