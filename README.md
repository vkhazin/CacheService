# Cache Service #

# Overview #
Cache service with http end-point for interopability.

# Setup #
* Install node.js
* Clone project from terminal window: git clone https://vkhazin@bitbucket.org/morneaushepell/cacheservice.git
* Install dependencies from terminal window: npm install
* Run from command window: node app.js

# End-Points #

## Echo ##

### Request ###

GET: http://localhost:3000/  
GET: http://localhost:3000/echo  
GET: http://localhost:3000/v1/  
GET: http://localhost:3000/v1/echo  

### Response ###

Status: 200  
```
{
  "name": "cache-service",
  "version": "1.0.0",
  "description": "Cache service using http end-point",
  "author": "Vlad Khazin <vladimir.khazin@icssolutions.ca>",
  "node": "v4.2.2"
}
```

## Set ##

### Request ###

POST: http://localhost:3000/v1/myKey
```
{
	"ttlSec": 10,
	"value": "dummy"
}
```

### Response ###

Status: 200  
```
{
	"key":"035a9363-d381-4651-9dd5-00f9025c0c2b",
	"ttlSec":3600,
	"value":
	{
		"ttlSec":10,
		"value":"dummy"
	}
}
```

## Get ##

### Request - Success ###

Get: http://localhost:3000/v1/myKey

### Response ###

Status: 200  
```
"dummy"
```

### Request - Failure ###

Get: http://localhost:3000/v1/myKey

### Response ###

Status: 404  
```
"Key: {myKey} was not found in the cache"
```

## Del ##

### Request ###

DEL: http://localhost:3000/v1/myKey

### Response - Success ###

Status: 200  
```
{
   "deleted":true
}
```

### Response - Failure ###

Status: 404  
```
"Key: {myKey} was not found in the cache"
```

# Environments #
Dev: http://cache-service-dev-ms.end-points.io/ (give it a min to warm up when it is slow)