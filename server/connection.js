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
  init : init,
  doQuery : doQuery,
  doPredef : doPredef,
  close_connection : closePoolAndExit
};

/**
 * this function opens a connection
 */
async function init(){
  try{
    await oracledb.createPool({
        user: username,
        password: password,
        connectString: "(DESCRIPTION = (ADDRESS = (PROTOCOL = TCP)(HOST = " + hostname + ")(PORT = "+ port +"))(CONNECT_DATA = (SID = " + sid + ")))"
        }
    );
    console.log('connection pool started');
    }catch(err){
      console.error('init error: ' + err);
    }
}

/**
 * This function is a wrapper of the doQuery function performing the corresponding query to the id
 * @param {the address where the result will be sent} res 
 * @param {the predefined query id} id 
 */
async function doPredef(res, id){
  query = predef_Q.predef_queries[id-1];
  title = query.title;
  sql = query.sql;
  console.log('id: ' + id);
  console.log('sql: ' + sql);
  doQuery(res, sql);
}

/**
 * This function opens a connection and performs a query, then closes the connection
 * @param {the address where the result will be sent} res 
 * @param {the SQL query that will be performed on the server} sql 
 */
async function doQuery(res, sql) {
    await init();
    let connection;
    let result;
    try {
      // Get a connection from the default pool
      connection = await oracledb.getConnection();
      let options = { outFormat: oracledb.OBJECT };
      var t0 = performance.now();
      result = await connection.execute(sql, [], options);
      console.log(result);
    } catch (err) {
      console.error(err);
    } finally {
      if (connection) {
        try {
          var t1 = performance.now();
          var perf = t1 - t0;
          // Put the connection back in the pool
          console.log('returning result');
          display(result, perf, res);
        } catch (err) {
          console.error(err);
        } finally{
          closePoolAndExit();
        }
      }
    }
  }

  /**
   * this function closes the connection
   */
  async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
      await oracledb.getPool().close(10);
    } catch(err) {
      console.error(err.message);
    } finally{
      console.log('Pool closed');
    }
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