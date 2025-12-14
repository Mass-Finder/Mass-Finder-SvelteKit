/**
 * 원소별 개수를 저장하는 맵
 */
export type ElementMap = Record<string, number>;

/**
 * 분자식을 파싱하여 원소별 개수 맵으로 변환
 *
 * @param formula - 분자식 문자열 (예: "C4H5NO2")
 * @returns 원소별 개수 맵 (예: {C: 4, H: 5, N: 1, O: 2})
 *
 * @example
 * parseFormula("C4H5NO2") // {C: 4, H: 5, N: 1, O: 2}
 * parseFormula("CH3") // {C: 1, H: 3}
 * parseFormula("C") // {C: 1}
 */
export function parseFormula(formula: string): ElementMap {
	const elementMap: ElementMap = {};

	// 원소 기호와 개수를 매칭하는 정규식
	// 대문자로 시작, 소문자가 있을 수 있고, 뒤에 숫자가 올 수 있음
	const regex = /([A-Z][a-z]?)(\d*)/g;
	let match;

	while ((match = regex.exec(formula)) !== null) {
		const element = match[1];
		const count = match[2] === '' ? 1 : parseInt(match[2], 10);

		if (element) {
			elementMap[element] = (elementMap[element] || 0) + count;
		}
	}

	return elementMap;
}

/**
 * 두 분자식을 빼기 연산 (element-wise subtraction)
 *
 * @param formula1 - 피감수 분자식
 * @param formula2 - 감수 분자식
 * @returns 차이 분자식 (음수 계수 가능)
 *
 * @example
 * subtractFormula("C4H5", "C3H2") // {C: 1, H: 3}
 * subtractFormula("C3H2", "C1H4") // {C: 2, H: -2}
 */
export function subtractFormula(formula1: string, formula2: string): ElementMap {
	const map1 = parseFormula(formula1);
	const map2 = parseFormula(formula2);
	const result: ElementMap = { ...map1 };

	// formula2의 각 원소를 result에서 빼기
	for (const element in map2) {
		result[element] = (result[element] || 0) - map2[element];
	}

	return result;
}

/**
 * 원소 맵을 분자식 문자열로 변환
 *
 * @param elementMap - 원소별 개수 맵
 * @returns 분자식 문자열 (음수는 H-2 형태로 표시)
 *
 * @example
 * elementMapToFormula({C: 1, H: 3}) // "CH3"
 * elementMapToFormula({C: 2, H: -2}) // "C2H-2"
 * elementMapToFormula({C: 1}) // "C"
 */
export function elementMapToFormula(elementMap: ElementMap): string {
	// 원소를 표준 순서로 정렬 (C, H, N, O, S, P, 기타 알파벳 순)
	const elementOrder = ['C', 'H', 'N', 'O', 'S', 'P'];
	const elements = Object.keys(elementMap).sort((a, b) => {
		const indexA = elementOrder.indexOf(a);
		const indexB = elementOrder.indexOf(b);

		// 둘 다 표준 원소인 경우
		if (indexA !== -1 && indexB !== -1) {
			return indexA - indexB;
		}
		// a만 표준 원소인 경우
		if (indexA !== -1) {
			return -1;
		}
		// b만 표준 원소인 경우
		if (indexB !== -1) {
			return 1;
		}
		// 둘 다 표준 원소가 아닌 경우 알파벳 순
		return a.localeCompare(b);
	});

	let formula = '';

	for (const element of elements) {
		const count = elementMap[element];

		// 0인 원소는 생략
		if (count === 0) {
			continue;
		}

		formula += element;

		// 1이 아니거나 음수인 경우 숫자 표시
		if (count !== 1) {
			formula += count;
		}
	}

	return formula || ''; // 빈 문자열 반환 (모든 원소가 0인 경우)
}

/**
 * 분자식 뺄셈을 수식 형태로 포맷
 *
 * @param formula1 - 피감수 분자식
 * @param formula2 - 감수 분자식
 * @returns 뺄셈 수식과 결과 (예: "C4H5 - C3H2 = CH3")
 *
 * @example
 * formatFormulaSubtraction("C4H5", "C3H2") // "C4H5 - C3H2 = CH3"
 * formatFormulaSubtraction("C3H2", "C1H4") // "C3H2 - C1H4 = C2H-2"
 */
export function formatFormulaSubtraction(formula1: string, formula2: string): string {
	const result = subtractFormula(formula1, formula2);
	const resultFormula = elementMapToFormula(result);

	return `${formula1} - ${formula2} = ${resultFormula}`;
}

/**
 * 화학식을 아래첨자 숫자가 포함된 형태로 변환
 *
 * 화학식의 숫자를 HTML 아래첨자 태그로 변환합니다.
 * 음수 부호도 함께 아래첨자로 처리됩니다.
 * 예시: C5H11NO2 -> C<sub>5</sub>H<sub>11</sub>NO<sub>2</sub>
 * 예시: C2H-2 -> C<sub>2</sub>H<sub>-2</sub>
 *
 * @param formula - 분자식 문자열 (예: "C5H11NO2", "C2H-2")
 * @returns 아래첨자 형식이 적용된 HTML 문자열
 */
export function formatFormula(formula: string): string {
  if (!formula) return '';

  // 음수 부호를 포함한 숫자를 아래첨자 HTML 태그로 변환
  // -?\d+ 패턴: 선택적 마이너스 부호와 숫자
  return formula.replace(/(-?\d+)/g, '<sub>$1</sub>');
}
