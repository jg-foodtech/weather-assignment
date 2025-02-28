import * as constant from "../constants/constant";
import * as utils from "../utils/utils";

/**
 *  To display Korean, make string based on queryConfig
 */
export const generateNaturalLanguageQuery = (queryConfig) => {
  const selectedColumns = queryConfig.columnData
    .filter(item => item.checked)
    .map(item => item.name)
    .join(", ");
  
  let queryText = `${queryConfig.table} 테이블에서 ${selectedColumns} 정보를 조회합니다.\n`;

  const regions = queryConfig.columnData
  .filter(column => !column.rangable && column.region)
  .map(column => column.region)
  .join(" ");

  const filterConditions = queryConfig.columnData
    .filter(column => column.rangable)
    .map(column => {
      if (column.onlyMin) return `${column.name}의 최솟값을 찾습니다.\n`;
      if (column.onlyMax) return `${column.name}의 최댓값을 찾습니다.\n`;
      if (column.greaterThan !== "" && column.lessThan !== "")
        return `${column.name}은(는) ${column.greaterThan} 이상 ${column.lessThan} 이하입니다.\n`;
      if (column.greaterThan !== "") return `${column.name}은(는) ${column.greaterThan}이상입니다.\n`;
      if (column.lessThan !== "") return `${column.name}은(는) ${column.lessThan}이하입니다.\n`;
      return null;
    })
    .filter(Boolean);
  
    if (regions || filterConditions.length > 0) {
      queryText += "필터 조건은 다음과 같습니다:";
      if (regions) {
        queryText += `\n${regions}의 정보를 조회합니다.`;
      }
      if (filterConditions.length > 0) {
        queryText += "\n" + filterConditions.join(" ");
      }
    } else {
      queryText += "전체 정보를 조회합니다.\n";
    }

  
  if (queryConfig.orderBy && !queryConfig.orderFixed) {
    queryText += ` 정렬 기준은 ${queryConfig.orderBy}이며, ${queryConfig.desc ? "내림차순" : "오름차순"}입니다.\n`;
  }

  if (queryConfig.limit ) {
    if (queryConfig.limit === constant.SHOW_ALL) {
      queryText += `결과를 모두 조회합니다.`;
    } else {
      queryText += `최대 ${queryConfig.limit}개를 조회합니다.`;
    }
  }

  if (queryConfig.distinct) {
    queryText += ` 중복된 값은 제거됩니다.`;
  }

  return queryText;
};

/**
 *  To send natural language as a param, translate to English with queryConfig
 */
export const generateNaturalLanguageQueryEng = (queryConfig) => {
  const selectedColumns = queryConfig.columnData
    .filter(item => item.checked)
    .map(item => utils.translate(item.name))
    .join(", ");
  
  let queryText = `${utils.translate(queryConfig.table)} 테이블에서 ${selectedColumns} 정보를 조회합니다.\n`;

  const regions = queryConfig.columnData
  .filter(column => !column.rangable && column.region)
  .map(column => {
    return `${utils.translate(column.name)} ${column.region} 찾습니다.\n`;
  }).join(" ");;
    

  const filterConditions = queryConfig.columnData
    .filter(column => column.rangable)
    .map(column => {
      if (column.onlyMin) return `${utils.translate(column.name)}의 최솟값을 찾습니다.\n`;
      if (column.onlyMax) return `${utils.translate(column.name)}의 최댓값을 찾습니다.\n`;
      if (column.greaterThan !== "" && column.lessThan !== "")
        return `${utils.translate(column.name)}은(는) ${column.greaterThan} 이상 ${column.lessThan} 이하입니다.\n`;
      if (column.greaterThan !== "") return `${utils.translate(column.name)}은(는) ${column.greaterThan}이상입니다.\n`;
      if (column.lessThan !== "") return `${utils.translate(column.name)}은(는) ${column.lessThan}이하입니다.\n`;
      return null;
    })
    .filter(Boolean);
  
    if (regions || filterConditions.length > 0) {
      queryText += "검색 조건은 다음과 같습니다:";
      if (regions) {
        queryText += `\n${regions}`;
      }
      if (filterConditions.length > 0) {
        queryText += "\n" + filterConditions.join(" ");
      }
    } else {
      queryText += "조건 없이 전체를 조회합니다.\n";
    }

  
  if (queryConfig.orderBy && !queryConfig.orderFixed) {
    queryText += ` 정렬 기준은 ${utils.translate(queryConfig.orderBy)}이며, ${queryConfig.desc ? "내림차순" : "오름차순"}입니다.\n`;
  }

  if (queryConfig.limit ) {
    if (queryConfig.limit === constant.SHOW_ALL) {
      queryText += `결과를 모두 조회합니다.`;
    } else {
      queryText += `최대 ${queryConfig.limit}개를 조회합니다.`;
    }
  }

  if (queryConfig.distinct) {
    queryText += ` 중복된 값은 제거됩니다.`;
  }

  return queryText;
};
