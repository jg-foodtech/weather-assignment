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

export function korToEng(str) {
    switch(str) {
        case '도/특별시/광역시':
            return 'sido';
        case '시/군/구':
            return 'sigungu';
        case '읍/면/동':
            return 'dong';
        case '날짜':
            return 'datetime';
        case '기온':
            return 'temperature';
        case '강수량':
            return 'precipitation';            
        case '적설량':
            return 'snowfall';
        default:
            break;
    }
    console.log("Cannot reach here");
    return "";
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
    
    console.log("Cannot reach here");
    return "";
}
