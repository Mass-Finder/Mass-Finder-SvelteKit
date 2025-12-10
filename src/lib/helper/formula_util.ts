/**
 * 화학식을 아래첨자 숫자가 포함된 형태로 변환
 *
 * 화학식의 숫자를 HTML 아래첨자 태그로 변환합니다.
 * 예시: C5H11NO2 -> C<sub>5</sub>H<sub>11</sub>NO<sub>2</sub>
 *
 * @param formula - 분자식 문자열 (예: "C5H11NO2")
 * @returns 아래첨자 형식이 적용된 HTML 문자열
 */
export function formatFormula(formula: string): string {
  if (!formula) return '';

  // 숫자를 아래첨자 HTML 태그로 변환
  return formula.replace(/(\d+)/g, '<sub>$1</sub>');
}
