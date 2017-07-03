const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')

server.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://course-todo-list.herokuapp.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Access-Control-Allow-Origin');
  next();
});

server.use('/api', router);
server.listen((process.env.PORT != 5000 ? process.env.PORT : 3000), () => {
  console.log('JSON Server is running');
});

