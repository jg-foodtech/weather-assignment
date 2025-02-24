import * as utils from './utils';
import * as constant from './constant';

class ParamBuilder {
    constructor() {
      this.params = [];
    }
  
    select(fields) {
      if (fields && Array.isArray(fields)) {
        this.params.push(`select=${fields.join(',')}`);
      } else {
        this.params.push(`select=*`);
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
          console.log(`where=${column}=${value}`);
        }
      }
      return this;
    }
  
    orderby(column, desc = false) {
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
  