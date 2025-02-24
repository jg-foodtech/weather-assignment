import { data } from './distinct';

export function getFirstElements() {
    const firstElements = data.map(row => row[0]);
    const uniqueFirstElements = [...new Set(firstElements)].sort();
    return uniqueFirstElements;
}

export function getSecondElements(first) {
    const second = [];
    data.forEach(row => {
        if (row[0] === first) {
            second.push(row[1]);
        }
    });
    const uniqueSecond = [...new Set(second)].sort();
    return uniqueSecond;
}

export function getThirdElements(first, second) {
    const third = [];
    data.forEach(row => {
        if (row[0] === first && row[1] === second) {
            third.push(row[2]);
        }
    });
    const uniqueThird = [...new Set(third)].sort();
    return uniqueThird;
}

const languageMap = {
    '도/특별시/광역시': 'sido',
    '시/군/구': 'sigungu',
    '읍/면/동': 'dong',
    '날짜': 'datetime',
    '기온': 'temperature',
    '강수량': 'precipitation',
    '적설량': 'snowfall',
    'sido': '도/특별시/광역시',
    'sigungu': '시/군/구',
    'dong': '읍/면/동',
    'datetime': '날짜',
    'temperature': '기온',
    'precipitation': '강수량',
    'snowfall': '적설량',
  };

export function translate(str) {
  return languageMap[str] || str;
}

export function stringToOperator(str) {
	switch(str) {
		case "일치":
        case "당일":
            return "=";
        case "이상":
            return ">=";
        case "이하":
            return "<=";
        case "초과":
        case "이후":
            return ">";
        case "미만":
        case "이전":
            return "<";
        default:
            break;
    }
    
    return str;
}
