// TODO: Find out what keeps hanging. Is it the redis client?

var net = require('net');

var Q     = require('q');
var redis = require('redis').createClient();

redis.on('error', function(e) {
	console.log('Redis Error: ', e);
});

var server = net.createServer();
var port = 9100;

// takes a callback and returns a function that takes a value that calls the
// callback without an error and with the value.
var tocb = function(cb) {
	return function(v) {
		cb(null, v);
	};
};

var dummyport = function() {
	return Math.random() * (9150 - 9101) + 9101
};

var register = function(options) {
	var name    = options.name;
	var version = options.version;
	var host    = options.host;
	var port    = options.port;

	return Q.all([
		Q.ninvoke(redis, 'hmset', 'services:' + name + ':' + version,
			'name',    name,
			'version', version,
			'host',    host,
			'port',    port
		),
		Q.ninvoke(redis, 'sadd', 'service-versions:' + name, version)
			.then(Q.ninvoke(redis, 'sort', 'service-versions:' + name, 'ALPHA', 'DESC'))
	]);
};

var unregister = function(options, cb) {
	var name    = options.name;
	var version = options.version;

	return Q.all([
		Q.ninvoke(redis, 'hdel', 'services:' + name + ':' + version),
		Q.ninvoke(redis, 'srem', 'service-versions' + name, version)
	]);
};

var query = function(options, cb) {
	// TODO: implement
};

server.on('listening', function() {
});

server.on('close', function() {
});

server.on('connection', function(c) {
	c.on('end', function() {
	});
});

server.on('error', function(e) {
	throw e;
});

server.listen(port);


// testing here
register({name: 'myservice', version: '0.0.0', host: 'localhost', port: dummyport()})
	.done(function() {
		console.log('done');
		redis.close();
	});

Q.all([
	register({ name: 'myservice', version: '0.0.0', host: 'localhost', port: dummyport() }),
	register({ name: 'myservice', version: '0.0.1', host: 'localhost', port: dummyport() }),
	register({ name: 'myservice', version: '0.0.2', host: 'localhost', port: dummyport() })
])
	.fail(function(e) {
		console.log('fail', e);
	})
	.then(function(values) {
		console.log('then', values);
	})
	.done();


