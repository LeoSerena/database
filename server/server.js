var express = require('express');
var connection = require('./connection');

var app = express();
app.use(express.json());

app.use(express.static('lib'));

app.get('/', (req, res) => {
   res.send('this is the tunnel created by Ngrokwith Http Auth');
});

app.get('/index.html', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
});

app.post('/special_query',  function(req, res){
   var sql = JSON.stringify(req.body);
   sql = JSON.parse(sql).query
   console.log('query: ' + sql);
   connection.doQuery(res, sql);
});

app.post('/predef_query', function(req, res){
   var id = JSON.stringify(req.body);
   id = JSON.parse(id).id;
   console.log('query id: ' + id);
   connection.doPredef(res, id)
})

var server = app.listen(8081, function () {
   var port = server.address().port;
   connection.init();
   console.log("Example app listening at port " + port);
});

process.on('SIGINT', function(){
   server.close(function(){
      connection.close_connection()
      process.exit(0);
   });
});