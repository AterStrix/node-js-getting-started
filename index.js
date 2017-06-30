var express = require('express');
var app = express();
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const http = require('http');
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/api/**', function(request, response) {
	var options = {
		host: request.hostname,
		port: 3000,
		path: request.url,
		method: request.method,
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

server.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Access-Control-Allow-Origin');
  next();
});

/*router.render = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}*/

server.use(router);
server.listen(app.get('port'), () => {
  console.log('JSON Server is running');
});

