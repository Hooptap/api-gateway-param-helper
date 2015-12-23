'use strict';
let ut = require('./ht-util');
let apigateway = require('./apigateway');
let async = require('async');
let apiId = process.argv[2];
let action = process.argv[3];
let paramName = process.argv[4];
if(process.argv.length < 5){
  throw new TypeError('Param name is required => node --harmony app.js [apiId] [action] [param-name]');
}

if(['add', 'remove'].indexOf(action) === -1){
  throw new Error('Only add and remove actions allowed');
}

let getMethodsArray = (methods) => {
  let methodArray = Object.keys(methods);
  let index = methodArray.indexOf('OPTIONS');
  if(index > -1){
    methodArray.splice(index, 1);
  }
  return methodArray;
};

let updateMethodMethod = (apiId, resourceId, methodVerb, type) => {
  return (cb) => {

    ut.exec('apigateway update-method --rest-api-id ' + apiId +
    ' --resource-id ' + resourceId + ' --http-method ' + methodVerb +
    ' --patch-operations op="' + action + '",path="/requestParameters/method.request.header.' + paramName + '"')
    .then(() => {
      cb();
    })
    .catch((err) => {
      console.log(err);
      cb(err);
    });
  };
}

let updateMethodIntegration = (apiId, resourceId, methodVerb, type) => {
  return (cb) => {

    ut.exec('apigateway update-integration --rest-api-id ' + apiId +
    ' --resource-id ' + resourceId + ' --http-method ' + methodVerb +
    ' --patch-operations op="' + action + '",path="/requestParameters/integration.request.header.' + paramName + '",value="method.request.header.' + paramName + '"')
    .then(() => {
      cb();
    })
    .catch((err) => {
      console.log(err);
      cb(err);
    });
  };
}

let updateResource = (resource, key, callback) => {
  if( resource.resourceMethods ){
    let methods = getMethodsArray(resource.resourceMethods);
    let tasks = [];
    for (var i = 0; i < methods.length; i++) {
      let methodVerb = methods[i];
      tasks.push(updateMethodMethod(apiId, resource.id, methodVerb));
      tasks.push(updateMethodIntegration(apiId, resource.id, methodVerb));
    }

    async.series(tasks, (err, results) => {
      callback(err);
    });
  }
  else{
    callback();
  }
};

let p = ut.exec('apigateway get-resources --rest-api-id ' + apiId)
.then((output) => {
  async.forEachOfSeries(output.items, updateResource);
})
.catch((err) => {
  console.log(err);
});
