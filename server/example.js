var http = require('http');
var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');
var httpPort = 7000;

function init() {
    oracledb.createPool(
      {
        user: dbConfig.user,
        password: dbConfig.password,
        connectString: dbConfig.connectString
        // edition: 'ORA$BASE', // used for Edition Based Redefintion
        // events: false, // whether to handle Oracle Database FAN and RLB events or support CQN
        // externalAuth: false, // whether connections should be established using External Authentication
        // homogeneous: true, // all connections in the pool have the same credentials
        // poolAlias: 'default', // set an alias to allow access to the pool via a name
        // poolIncrement: 1, // only grow the pool by one connection at a time
        // poolMax: 4, // maximum size of the pool. Increase UV_THREADPOOL_SIZE if you increase poolMax
        // poolMin: 0, // start with no connections; let the pool shrink completely
        // poolPingInterval: 60, // check aliveness of connection if idle in the pool for 60 seconds
        // poolTimeout: 60, // terminate connections that are idle in the pool for 60 seconds
        // queueTimeout: 60000, // terminate getConnection() calls in the queue longer than 60000 milliseconds
        // sessionCallback: myFunction, // function invoked for brand new connections or by a connection tag mismatch
        // stmtCacheSize: 30 // number of statements that are cached in the statement cache of each connection
      },
      function(err, pool) {
        if (err) {
          console.error("createPool() error: " + err.message);
          return;
        }
  
        // Create HTTP server and listen on port - httpPort
        http
          .createServer(function(request, response) {
            handleRequest(request, response, pool);
          })
          .listen(httpPort);
  
        console.log("Server running at http://localhost:" + httpPort);
      }
    );
  }
  
  function handleRequest(request, response, pool) {
    var urlparts = request.url.split("/");
    var deptid = urlparts[1];
  
    htmlHeader(
      response,
      "Oracle Database Driver for Node.js",
      "Example using node-oracledb driver"
    );
  
    if (deptid == 'favicon.ico') {
      htmlFooter(response);
      return;
    }
  
    if (deptid != parseInt(deptid)) {
      handleError(
        response,
        'URL path "' + deptid + '" is not an integer.  Try http://localhost:' + httpPort + '/30',
        null
      );
  
      return;
    }
  
    // Checkout a connection from the pool
    pool.getConnection(function(err, connection) {
      if (err) {
        handleError(response, "getConnection() error", err);
        return;
      }
  
      // console.log("Connections open: " + pool.connectionsOpen);
      // console.log("Connections in use: " + pool.connectionsInUse);
  
      connection.execute(
        `SELECT employee_id, first_name, last_name
         FROM employees
         WHERE department_id = :id`,
        [deptid], // bind variable value
        function(err, result) {
          if (err) {
            connection.close(function(err) {
              if (err) {
                // Just logging because handleError call below will have already
                // ended the response.
                console.error("execute() error release() error", err);
              }
            });
            handleError(response, "execute() error", err);
            return;
          }
  
          displayResults(response, result, deptid);
  
          /* Release the connection back to the connection pool */
          connection.close(function(err) {
            if (err) {
              handleError(response, "normal release() error", err);
            } else {
              htmlFooter(response);
            }
          });
        }
      );
    });
  }
  
  // Report an error
  function handleError(response, text, err) {
    if (err) {
      text += ": " + err.message;
    }
    console.error(text);
    response.write("<p>Error: " + text + "</p>");
    htmlFooter(response);
  }
  
  // Display query results
  function displayResults(response, result, deptid) {
    response.write("<h2>" + "Employees in Department " + deptid + "</h2>");
    response.write("<table>");
  
    // Column Title
    response.write("<tr>");
    for (var col = 0; col < result.metaData.length; col++) {
      response.write("<th>" + result.metaData[col].name + "</th>");
    }
    response.write("</tr>");
  
    // Rows
    for (var row = 0; row < result.rows.length; row++) {
      response.write("<tr>");
      for (col = 0; col < result.rows[row].length; col++) {
        response.write("<td>" + result.rows[row][col] + "</td>");
      }
      response.write("</tr>");
    }
    response.write("</table>");
  }
  
  // Prepare HTML header
  function htmlHeader(response, title, caption) {
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("<!DOCTYPE html>");
    response.write("<html>");
    response.write("<head>");
    response.write("<style>" +
      "body {background:#FFFFFF;color:#000000;font-family:Arial,sans-serif;margin:40px;padding:10px;font-size:12px;text-align:center;}" +
      "h1 {margin:0px;margin-bottom:12px;background:#FF0000;text-align:center;color:#FFFFFF;font-size:28px;}" +
      "table {border-collapse: collapse;   margin-left:auto; margin-right:auto;}" +
      "td, th {padding:8px;border-style:solid}" +
      "</style>\n");
    response.write("<title>" + caption + "</title>");
    response.write("</head>");
    response.write("<body>");
    response.write("<h1>" + title + "</h1>");
  }
  
  // Prepare HTML footer
  function htmlFooter(response) {
    response.write("</body>\n</html>");
    response.end();
  }
  
  function closePoolAndExit() {
    console.log("\nTerminating");
    try {
      // Get the pool from the pool cache and close it when no
      // connections are in use, or force it closed after 10 seconds
      oracledb.getPool().close(10, function(err) {
        if (err)
          console.error(err.message);
        else
          console.log("Pool closed");
        process.exit(0);
      });
    } catch(err) {
      console.error(err.message);
      process.exit(1);
    }
  }
  
  process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT',  closePoolAndExit);
  
  init();
