const express = require('express');
var app = express();
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
const events = require('events');

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(express.static('public'));
app.get('/index.htm', function (req, res) {
   res.sendFile( __dirname + "/" + "index.htm" );
})

app.post('/process_post', urlencodedParser, function(req, res){
   response = {
      query: req.body.query
   };
   console.log(response);
   res.end(JSON.stringify(response));
})

app.post('/test_connection', urlencodedParser, function(req, res){
   test_connection(res);
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})




var hostname = "cs322-db.epfl.ch"
var port = 1521
var sid = "ORCLCDB"
var username = "C##DB2019_G39"
var password = "DB2019_G39"

eventEmitter = new events.EventEmitter();

function test_connection(response){
    oracledb.getConnection(
        {
        user: username,
        password: password,
        connectString: "(DESCRIPTION = (ADDRESS = (PROTOCOL = TCP)(HOST = " + hostname + ")(PORT = "+ port +"))(CONNECT_DATA = (SID = " + sid + ")))"
        },
        function(err, connection){
            if(err){
              eventEmitter.emit('error', err);
              return;
            }
            connection.execute(
                `SELECT sailor_age
                FROM testTab
                WHERE sailor_id = :id`,
                [0],
                function(err, result){
                    if(err){
                        doRelease(connection);
                        eventEmitter.emit('error', err);
                        return;
                    }
                    res = result;
                    eventEmitter.emit('data_recieved', result, response);
                    return;
                }
            )
        }
    )
}

eventEmitter.on('error', function(error){
  console.log(error);
})
eventEmitter.on('data_recieved', function(result, response){
  console.log(result);
  response.end(JSON.stringify(result));
})