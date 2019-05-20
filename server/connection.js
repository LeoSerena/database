const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
const predef_Q = require('./predefined_queries');

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

async function doPredef(res, id){
  query = predef_Q.predef_queries[id-1];
  title = query.title;
  sql = query.sql;
  console.log('id: ' + id);
  console.log('sql: ' + sql);
  doQuery(res, sql);
}

async function doQuery(res, sql) {
    let connection;
    let result;
    try {
      // Get a connection from the default pool
      connection = await oracledb.getConnection();
      let options = { outFormat: oracledb.OBJECT };
      result = await connection.execute(sql, [], options);
      //console.log(result);
    } catch (err) {
      console.error(err);
    } finally { 
      if (connection) {
        try {
          // Put the connection back in the pool
          console.log('returning result');
          display(result, res);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
      await oracledb.getPool().close(10);
      console.log('Pool closed');
      process.exit(0);
    } catch(err) {
      console.error(err.message);
      process.exit(1);
    }
  }


  function display(result, res){
    res.send(JSON.stringify(result));
 };