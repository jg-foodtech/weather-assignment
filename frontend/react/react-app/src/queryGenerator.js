import * as constant from "./constant";

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
        return `${column.name}은(는) ${column.greaterThan}보다 크고 ${column.lessThan}보다 작습니다.\n`;
      if (column.greaterThan !== "") return `${column.name}은(는) ${column.greaterThan}보다 큽니다.\n`;
      if (column.lessThan !== "") return `${column.name}은(는) ${column.lessThan}보다 작습니다.\n`;
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