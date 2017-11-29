/**
 * Created by dvrbancic on 29/11/2017.
 */

var httpProxy = require('http-proxy');
var express = require('express');
var process = require('process');
var app = express();
var querystring = require('querystring')

//process.env.NODE_ENV = 'LIVE';
var Config = require('./config/Config.js'), config = new Config();

var proxy = httpProxy.createProxyServer();

proxy.on('error', function(error) {
  console.log('proxy error:', error)
})

app.all('/monit/*', function(req, res) {
  console.log('/monit/ -> ProxyService:', req.url);
  req.url = req.params[0] + '?' + querystring.stringify(req.query);
  console.log('/monit/ 2 -> ProxyService:', req.url);
  var c = proxy.web(req, res, { xfwd: true, target: 'http://localhost:' + config.proxy_service.port_monit });
});

app.all('/wiki/*', function(req, res) {
  console.log('/wiki/ -> WikiService:', req.url);
  req.url = req.params[0] + '?' + querystring.stringify(req.query);
  console.log('/wiki/ 2 -> WikiService:', req.url);
  var c = proxy.web(req, res, { xfwd: true, target: 'http://localhost:' + config.proxy_service.port_wiki });
});

/*
app.all('*', function(req, res) {
  console.log('/* -> ProxyService:', req.url);
  req.url = req.params[0] + '?' + querystring.stringify(req.query)
  console.log('RUTA: ' + req.url)
  var c = proxy.web(req, res, { xfwd: true, target: 'http://localhost:' +  + config.proxy_service.port_monit })
});
*/



app.listen(config.proxy_service.port, function() {
  console.log('Proxy running on', config.proxy_service.port)
});


