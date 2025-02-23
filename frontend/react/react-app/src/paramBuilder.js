import * as utils from './utils';

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
        if (condition) {
          const operator = utils.stringToOperator(condition);
          this.params.push(`where=${column}${operator}${value}`);
        } else {
          this.params.push(`where=${column}=${value}`);
        }
      }
      return this;
    }
  
    orderby(column, desc = false) {
      if (column) {
        this.params.push(`orderby=${column}`);
        this.params.push(`desc=${desc ? 'true' : 'false'}`);
      }
      return this;
    }
  
    limit(count) {
      if (count) {
        this.params.push(`limit=${count}`);
      }
      return this;
    }
  
    build() {
      return this.params.join('&');
    }
  }
  
  export default ParamBuilder;
  