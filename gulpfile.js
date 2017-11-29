var gulp = require('gulp');
var child_process = require('child_process');
var process = require('process');

var execSync = require('child_process').execSync

//---------------------------------------------------
var Config = require('./config/Config.js');

function exec(format, params) {
  execSync(require('util').format.apply(null, arguments))
}

//gulp functions
//**********************************************************************************************************************
function restartProxy(server_user, server_ip) {
  console.log("------------------------------------------------------------");
  console.log('restart ProxyService (%s) on server -> %s:%s', config.service.mode, server_ip, config.proxy_service.port);

  console.log("stopping ProxyService....");
  try {
    exec('ssh %s@%s "pm2 delete ProxyService --silent"', server_user, server_ip);
  } catch(e){
    console.log("err: Unable to stop ProxyService OR already stopped!");
  };

  console.log("transfer source....");
  exec('scp ProxyService.js %s@%s:./ProxyService/', server_user, server_ip);
  exec('scp package.json %s@%s:./ProxyService/', server_user, server_ip);
  exec('scp -r config %s@%s:./ProxyService/', server_user, server_ip);

  console.log("starting ProxyService....");
  let addServiceName = "ProxyService";
  let addLogTS = "--log-date-format \'YYYY-MM-DD HH:mm:ss\'";
  let addPSNumber = "-i 1";
  exec("ssh %s@%s \"cd %s; NODE_ENV=LIVE pm2 start ProxyService.js --name %s %s %s\"", config.server.user, config.server.ip, config.service.path, addServiceName, addLogTS, addPSNumber);

  console.log("------------------------------------------------------------");
}

//gulp tasks
//**********************************************************************************************************************
gulp.task('stop_proxy_develop', [], function (done) {
  try {exec('pm2 delete ProxyService --silent');} catch (e) {}
  done()
});

gulp.task('proxy_live', [], function (done) {
    process.env.NODE_ENV = 'LIVE';
    config = new Config();
    restartProxy(config.server.user, config.server.ip);
    done()
});

gulp.task('proxy_develop', [], function (done) {
  process.env.NODE_ENV = 'DEVELOP';
  config = new Config();
  console.log("------------------------------------------------------------");
  console.log('restart ProxyService (%s):  %s:%s', config.service.mode, config.server.ip, config.proxy_service.port);
  try {exec('pm2 delete ProxyService --silent');} catch (e) {}
  exec('NODE_ENV=DEVELOP pm2 start ProxyService.js');
  console.log("------------------------------------------------------------");
  done()
});






