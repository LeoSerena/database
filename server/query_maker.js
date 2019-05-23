/**
 * This file takes input values and returns the corresponding SQL query
 */

 module.exports = {
     make_SQL : make_SQL
 };

min_price = 0;

 //return format: listing_name, listing_url, space, price, city, neigbourhood
 function make_SQL(data){

    var sql_select = `SELECT DISTINCT(L.name), L.listing_url, L.square_feet, L.price, C.city, N.neigh, H.host_name, H.host_url`;

    console.log(data);
    sql = sql_select + make_from(data) + make_where(data) + ' FETCH FIRST 5 ROWS ONLY';
    console.log(sql);
    return sql;
 }


 function make_from(data){
    sql_from = ` FROM Listings L, Hosts H, Cities C, Neigh N`;

    //calendar if needed
    if(data.date_from != '' || data.date_to != ''){
       sql_from = sql_from + `, Calendar C`;
    }
    return sql_from;
 }

 function make_where(data){
    sql_where = ` WHERE L.host_id = H.host_id
    AND N.city_id = C.city_id
    AND L.neigh_id = N.neigh_id`;

    //city choice
    if(!(data.madrid && data.barcelona && data.berlin)){
        if(data.madrid){
            sql_where = sql_where + " AND C.city = 'madrid'";
        }
        if(data.barcelona){
            sql_where = sql_where + " AND C.city = 'bacelona'";
        }
        if(data.berlin){
            sql_where = sql_where + " AND C.city = 'berlin'";
        }
    }

    //availability choice
    if(data.date_from != '' || data.date_to != ''){
        if(data.date_from != ''){
            sql_where = sql_where + " AND C.date_calendar > TO_DATE('" + data.date_from + "', 'yyyy-mm-dd')";
        }
        if(data.date_to != ''){
            sql_where = sql_where + " AND C.date_calendar < TO_DATE('" + data.date_to + "', 'yyyy-mm-dd')";
        }
    }

    //price choice
    if(data.price_from != '' || data.price_to != ''){
        if(data.price_from != ''){
            sql_where = sql_where + ' AND L.price > ' + data.price_from;
        }
        if(data.price_to != ''){
            sql_where = sql_where + ' AND L.price < ' + data.price_to;
        }
    }

    return sql_where;
}