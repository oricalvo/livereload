var express = require('express');
var path = require('path');
var http = require('http');
var request = require("request");
var passthroughBaseUrl = "/serverapi/";
var externalUrl = "http://qa-app2.eu1.moovitapp.com:8080/services-app/services/";
var oneDay = 86400000;

var app = express();

//
//  Static content
//
var static = express.static(path.join(__dirname, '..'), {maxAge: oneDay})
app.use('/', function(req, res, next) {
    console.log("STATIC: " + req.url);

    static(req, res, next);
});

//
//  All others URLs are redirected to the index.html
//
app.get('*', function(req, res, next) {
    console.log("DEFAULT: " + req.url + " --> /index.html");

    res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(8080);
