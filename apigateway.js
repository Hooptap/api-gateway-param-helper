module.exports = (() => {
  'use strict';

  let util = require('./ht-util');

  return {
    listApis : (cb) => {
      return util.exec('aws apigateway get-rest-apis', cb);
    }
  }
})();
