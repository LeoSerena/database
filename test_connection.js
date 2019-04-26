const oracledb = require('oracledb');
const events = require('events');
const express = require('express');
var server = require('./server.js');

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
              eventEmitter.emit('error', error);
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
                        eventEmitter.emit('error', error);
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


module.exports = {
  test_connection: test_connection()
}