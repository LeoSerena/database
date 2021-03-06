var express = require('express');
var connection = require('./connection');
var query_maker = require('./query_maker')
var predefined_queries = require('./predefined_queries');

var app = express();
app.use(express.json());

app.use(express.static('lib'));

app.get('/index.html', function (req, res) {
   res.sendFile(__dirname + '/' + 'index.html');
});
app.get('/predefined.html', function(req, res){
   res.sendFile(__dirname + '/' + 'predefined.html');
});
app.get('/modif.html', function(req, res){
   res.sendFile(__dirname + '/' + 'modif.html');
});

app.post('/search_query',  function(req, res){
   var data = JSON.stringify(req.body);
   data = JSON.parse(data);
   sql = query_maker.make_SQL(data)
   connection.doQuery(res, sql);
});
app.post('/full_query', function(req, res){
   var data = JSON.stringify(req.body);
   data = JSON.parse(data);
   connection.do_full_query(res, data)
});
app.post('/predef_query', function(req, res){
   var data = JSON.stringify(req.body);
   data = JSON.parse(data);
   connection.doPredef(res, data);
});
app.post('/predef_query_info', function(req, res){
   var id = JSON.stringify(req.body);
   id = JSON.parse(id).id;
   console.log('query id: ' + id);
   predefined_queries.get_predef_info(res, id)
})
app.post('/delete_neighborhood', function(req, res){
   console.log('delete recieved')
   var data = JSON.stringify(req.body);
   data = JSON.parse(data);
   connection.doDeletion(res, data);
});
app.post('/insert_neighborhood', function(req, res){
   console.log('insert recieved');
   var data = JSON.stringify(req.body);
   data = JSON.parse(data);
   connection.doInsertion(res, data);
});

var server = app.listen(8081, function () {
   var port = server.address().port;
   console.log("Example app listening at port " + port);
});

process.on('SIGINT', function(){
   server.close(function(){
      process.exit(0);
   });
});