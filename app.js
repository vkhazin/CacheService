/*********************************************************************************
Dependencies
**********************************************************************************/
var restify 	    = require('restify');
var config 		    = require('config');
var logger          = require('./logger').create(logger);
var cache           = require('./cache').create(config, logger);
/*********************************************************************************/

/**********************************************************************************
Configuration
**********************************************************************************/
var appInfo 		= require('./package.json');
var port 			= process.env.PORT || 3000;
var server 			= restify.createServer();
/*********************************************************************************/

/**********************************************************************************
Constants
**********************************************************************************/
var routePrefix                     = '/v1';
var headerTtl                       = 'x-ttl-sec'
/*********************************************************************************/

/**********************************************************************************
Setup
**********************************************************************************/
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());
server.opts(/.*/, function (req,res,next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", req.header("Access-Control-Request-Method"));
    res.header("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));
    res.send(200);
    return next();
});
server.use(restify.gzipResponse());

/**********************************************************************************
End-points
**********************************************************************************/
//Echo
server.get({path: routePrefix + '/echo', flags: 'i'}, echo);
server.get({path: routePrefix, flags: 'i'}, echo);
server.get({path: '/', flags: 'i'}, echo);
server.get({path: '/echo', flags: 'i'}, echo);

function echo(req, res, next) {
    var info = {
        name: appInfo.name,
        version: appInfo.version,
        description: appInfo.description,
        //author: appInfo.author,
        node: process.version
    };
    res.send(info);
    next();
}    

//Store value
server.post({path: routePrefix + '/:key', flags: 'i'}, setValue);

function setValue(req, res, next) {

    var input = parseRequest(req);

    var key = req.params.key;
    var value = input.value;
    var ttlSec = input.ttlSec || config.cache.defaultTtlSec || 3600;

    cache.set(key, value, ttlSec)
        .then(function(result) {
            res.send({
                key: key,
                ttlSec: ttlSec,
                value: value
            });     
        })
        .catch(function(err) {           
            logger.error(err);
            res.send(500, err);
        })
        .done(function(){
            next();
        });
};

//Get value
server.get({path: routePrefix + '/:key', flags: 'i'}, getValue);

function getValue(req, res, next) {

    var key = req.params.key;

    cache.get(key)
        .then(function(result) {
            if (result) {
                res.send(result);
            } else {
                res.send(404, 'Key: {' + key + '} was not found in the cache');
            }     
        })
        .catch(function(err) {           
            logger.error(err);
            res.send(500, err);
        })
        .done(function(){
            next();
        });
};

//Delete value
server.del({path: routePrefix + '/:key', flags: 'i'}, deleteValue);

function deleteValue(req, res, next) {

    var key = req.params.key;

    cache.del(key)
        .then(function(result) {
            if (result == true) {
                res.send({ deleted: result});
            } else {
                res.send(404, 'Key: {' + key + '} was not found in the cache');
            }     
        })
        .catch(function(err) {           
            logger.error(err);
            res.send(500, err);
        })
        .done(function(){
            next();
        });
};
/*********************************************************************************/

/**********************************************************************************
Functions
**********************************************************************************/
function parseRequest(req) {
    var output = {};
    if (typeof req.body == 'string') {
        output = JSON.parse(req.body);
    } else {
        output = req.body || {};
    }
    return output;
}
/**********************************************************************************
Start the server
**********************************************************************************/
server.listen(port, function() {
	var msg = 'Starting service using port \'{port}\' and environment \'{environment}\''
				.replace('{port}', port)
				.replace('{environment}', process.env.NODE_ENV)
	logger.log(msg);
});
/********************************************************************************/