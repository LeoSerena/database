const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
const predef_Q = require('./predefined_queries');
const { PerformanceObserver, performance } = require('perf_hooks');

var hostname = "cs322-db.epfl.ch"
var port = 1521
var sid = "ORCLCDB"
var username = "C##DB2019_G39"
var password = "DB2019_G39"   

module.exports = {
  doQuery : doQuery,
  doPredef : doPredef,
};


/**
 * This function is a wrapper of the doQuery function performing the corresponding query to the id
 * @param {the address where the result will be sent} res 
 * @param {the predefined query id} id 
 */
async function doPredef(res, id){
  query = predef_Q.predef_queries[id];
  sql = query.sql;
  doQuery(res, sql);
}


  /**
   * this function adds the performance to the result and sends the data
   * @param {the result of the query} result 
   * @param {the time that the query took in ms} perf 
   * @param {the address where the result will be sent} res 
   */
  function display(result, perf, res){
    result['perf'] = perf;
    res.send(result);
 };

/**
 * This function opens a connection and performs a query, then closes the connection
 * @param {the address where the result will be sent} res 
 * @param {the SQL query that will be performed on the server} sql 
 */
async function doQuery(res, sql) {
  console.log(sql);
  try{
    oracledb.getConnection({
      user:           username,
      password:       password,
      connectString:  "(DESCRIPTION = (ADDRESS = (PROTOCOL = TCP)(HOST = " + hostname + ")(PORT = "+ port +"))(CONNECT_DATA = (SID = " + sid + ")))"
    },
    function(err, connection){
      if(err){
        console.log(err);
        return;
      }
      var t0 = performance.now();
      console.log('connection established');
      connection.execute(
        sql,
        function(err, result){
          if(err){
            console.log(err);
            doRelease(connection)
            return;
          }else{
            var perf = performance.now()-t0;
            console.log(perf);
            display(result, perf, res)
          }
        }
      );
    }
  );
  } catch (err){
    res.send(err);
    return;
  }
}

function doRelease(connection) {
  connection.close(
    function(err) {
      if (err) {
        console.error(err.message);
      }
    }
  );
}