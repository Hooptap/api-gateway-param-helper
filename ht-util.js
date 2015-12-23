'use strict';
let exec = require('child_process').exec;
let Promise = require('promise');

let UtilMod = {
    exec : (command) => {
      let promise = new Promise((resolve, reject) => {
          console.log(command);
          return exec('aws ' + command, (err, stdout, stderr) => {
            if(err){
              reject(err);
            }
            else{
              resolve(JSON.parse(stdout));
            }
          });
      });
      return promise;
    },

    log : console.log,

    logCommand : (error, stdout, stderr) => {
      UtilMod.log("error", error);
      UtilMod.log("stdout", stdout);
      UtilMod.log('stderr', stderr);
    }
};
module.exports = UtilMod;
