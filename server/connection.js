const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;
const predef_Q = require('./predefined_queries');
const query_maker = require('./query_maker');
const { PerformanceObserver, performance } = require('perf_hooks');

var hostname = "cs322-db.epfl.ch"
var port = 1521
var sid = "ORCLCDB"
var username = "C##DB2019_G39"
var password = "DB2019_G39"   

module.exports = {
  doQuery : doQuery,
  doPredef : doPredef,
  doInsertion : doInsertion,
  doDeletion : doDeletion
};


/**
 * This function is a wrapper of the doQuery function performing the corresponding query to the id
 * @param {the address where the result will be sent} res 
 * @param {the predefined query id} id 
 */
async function doPredef(res, data){
  id = data.id;
  console.log(id)
  query = predef_Q.predef_queries[id];
  sql = query.sql;
  if (id==0){
    if (data.bed_N == ''){
       sql = sql + '8'
    }else{
      sql = sql + data.bed_N;
    }
  }
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
            doRelease(connection);
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



function doDeletion(res, data){
  return;
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

function doInsertion(res, data){
  ISIN(res, data, 'N');
}

async function ISIN(res, data, type) {
  var sql;
  if(type == 'N'){
    sql = query_maker.test_if_N_in_sql(data.N_to_insert);
    console.log('ISIN N')
  }else if(type == 'Ci'){
    sql = query_maker.test_if_Ci_in_sql(data.Ci_to_insert);
    console.log('ISIN Ci')
  }else if(type == 'Co'){
    sql = query_maker.test_if_Co_in_sql(data.Co_to_insert);
    console.log('ISIN Co')
  }else{
    console.log('type out of set')
    return;
  }
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
      console.log('connection established');
      connection.execute(
        sql,
        function(err, result){
          if(err){
            console.error(err);
            doRelease(connection);
          }else{
            console.log(result)
            if(result.rows.length == 0){
              if(type == 'N'){
                ISIN(res, data, 'Ci');
              }else if(type == 'Ci'){
                ISIN(res, data, 'Co');
              }else{
                insert(res, data, 'Co');
              }
            }else{
              if(type == 'N'){
                var msg = {};
                msg.message = 'insert done';
                res.send(msg);
              }else if(type == 'Ci'){
                insert(res, data, 'N');
              }else{
                insert(res, data, 'Ci');
              }
            }
          }
        }
      );
      return;
    }
  );
  } catch (err){
    res.send(err);
    return;
  }
}

function insert(res, data, type){
  var sql;
  if(type == 'N'){
    sql = query_maker.insert_N_sql(data.N_to_insert, data.Ci_to_insert);
    console.log('inserting N')
  }else if(type == 'Ci'){
    sql = query_maker.insert_Ci_sql(data.Ci_to_insert, data.Co_to_insert);
    console.log('inserting Ci')
  }else if(type = 'Co'){
    sql = query_maker.insert_Co_sql(data.Co_to_insert)
    console.log('inserting Co')
  }else{
    console.log('type not in set');
    return;
  }
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
      console.log('connection established');
      connection.execute(
        sql,
        function(err, result){
          if(err){
            console.error(err);
            doRelease(connection);
          }else{
            if(type == 'N'){
              var msg = {};
              msg.message = 'insertion done';
              res.send(msg);
            }else if(type == 'Ci'){
              insert(res, data, 'N');
            }else{
              insert(res, data, 'Ci');
            }
          }
          return;
        }
      );
    }
  );
  } catch (err){
    res.send(err);
    return;
  }
}