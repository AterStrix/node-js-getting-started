const cookieSession = require('cookie-session')
const express = require('express');
const app = express();
const http = require('http');
const bodyParser = require('body-parser');
const forward = require('http-port-forward');
const livereload = require('livereload');
const lrserver = livereload.createServer();
const env = require('node-env-file');

env(__dirname + '/local.env');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/angular/dist'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 86400000
}))

app.post('/api/login', function(request, response) {
	var options = {
		host: process.env.LOCAL ? request.hostname : 'api-' + request.hostname,
		port: process.env.LOCAL ? 3000 : 80,
		path: '/api/users?login=' + request.body.login + '&password=' + request.body.password,
		method: 'GET',
		params: request.params
	};
	var req = http.request(options, function(res) {
		res.setEncoding('utf8');

		res.on('data', function (chunk) {
			if (res.statusCode >= 400) {
				response
					.status(res.statusCode)
					.send({
						type: "error",
						statusCode: res.statusCode,
						statusMessage: res.statusMessage
					});
			}
			else if (chunk.length === 2) {
				response
					.status(403)
					.send({
						type: "error",
						statusCode: 403,
						statusMessage: "Entered login or password is incorrect"
					});
			}
			else {
				var userData = JSON.parse(chunk)[0];
				userData.password = undefined;
				userData = JSON.stringify(userData);
				request.session.authorized = true;
				response.write(userData);
			}
		});
		res.on('end', function(){
			response.end();
		});
	});
	req.end();
});

app.use((req, res, next) => {
	if (req.session.authorized || req.url === '/') {
		next();
	}
	else {
		res
			.status(403)
			.send({
				type: "error",
				statusCode: 403,
				statusMessage: "Unautorized"
			});
	}
});

app.get("/api/logout", function(request, response) {
	request.session.authorized = false;
	response.end();
});

app.get('/api/**', function(request, response) {
	var options = {
		host: process.env.LOCAL ? request.hostname : 'api-' + request.hostname,
		port: process.env.LOCAL ? 3000 : 80,
		path: request.url,
		method: 'GET',
		params: request.params
	};
	var req = http.request(options, function(res) {
		res.setEncoding('utf8');

		res.on('data', function (chunk) {
			if (res.statusCode >= 400) {
				response
					.status(res.statusCode)
					.send({
						type: "error",
						statusCode: res.statusCode,
						statusMessage: res.statusMessage
					});
			}
			else {
				response.write(chunk);
			}
		});
		res.on('end', function(){
			response.end();
		});
	});
	req.end();
});

app.get('/**', function(request, response) {
  response.sendFile(__dirname + '/angular/dist/index.html');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

if (process.env.LOCAL) {
	lrserver.watch(__dirname + "/angular/dist");
}
