var promise				= require('bluebird');
var redis		 		= require('promise-redis')(function(resolver) {
						    return new promise(resolver);
						});

exports.create =  function (cnf, lgr) {
	var client 	= null;
	var config 	= cnf;
	var logger 	= lgr;

	var getRedisClient = function () {
		var url = process.env.REDISCLOUD_URL || config.cache.url;
	    if (!client) {
			logger.info('Connecting to ' + url);
    		client = redis.createClient(url);
 		}
		return promise.resolve(client);
	};

	var handleError = function(err) {
		logger.error('Error using cache');
		logger.error(err);
		return promise.reject(err);
	};

	return (function () {
	    return {
	        get: function (key) {
	        	return getRedisClient()
	        		.then(function(client) {
	        			return client.get(key);
	        		})
	        		.then(value => {
	        			try {
	        				return JSON.parse(value);
	        			}
	        			catch (err) {
	        				return value;
	        			}
	        		})
	        		.catch(function(err){
	        			logger.error('error getting value')
	        			return handleError(err);
	        		});
	        },
	        set: function (key, value, ttlSec) {
	        	return getRedisClient()
	        		.then(function(client) {
	        			//To support objects as well
	        			if (typeof value === 'object') {
	        				value = JSON.stringify(value);
	        			}
	        			return client.set(key, value)
	        		})
	        		.then(function(result){
	        			if (ttlSec > 0) {
	        				return client.expire(key, ttlSec)
	        			} else {
	        				return promise.resolve(null);
	        			}
	        		})
	        		.catch(function(err){
	        			return handleError(err);
	        		});
	        },
	        del: function (key) {
	        	return getRedisClient()
	        		.then(function(client) {
	        			return client.del(key);
	        		})
	        		.then(function(result){
	        			return promise.resolve(result == true);
	        		})
	        		.catch(function(err){
	        			return handleError(err);
	        		});
	        }	        
	    };
	}());
};