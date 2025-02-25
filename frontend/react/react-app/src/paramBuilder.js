import * as utils from './utils';
import * as constant from './constant';

class ParamBuilder {
    constructor() {
      this.params = [];
    }
  
    select(fields, distinct) {
      if (fields && Array.isArray(fields)) {
        this.params.push(`select=${fields.join(',')}`);
      } else {
        this.params.push(`select=*`);
      }
      if (distinct) {
        this.params.push(`distinct=${distinct ? 'true' : 'false'}`);
      }
      return this;
    }

    from(table) {
      if (table) {
        this.params.push(`from=${table}`);
      }
      return this;
    }
  
    where(column, value, condition) {
      if (column && value) {
        column = utils.translate(column);
        if (condition) {
          const operator = utils.stringToOperator(condition);
          this.params.push(`where=${column}${operator}${value}`);
        } else {
          this.params.push(`where=${column}=${value}`);
        }
      }
      return this;
    }
  
    orderBy(column, desc) {
      // Ignore if exist
      if (this.params.some(param => param.startsWith("orderby="))) {
        return this;
      }

      column = utils.translate(column);
      if (column) {
        this.params.push(`orderby=${column}`);
        this.params.push(`desc=${desc ? 'true' : 'false'}`);
      }
      return this;
    }
  
    limit(count) {
      if (count !== constant.ShowAll) {
        this.params.push(`limit=${count}`);
      }
      return this;
    }
  
    build() {
      return this.params.join('&');
    }
  }
  
  export default ParamBuilder;
  