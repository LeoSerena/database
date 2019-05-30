/**
 * This file takes input values and returns the corresponding SQL query
 */

 module.exports = {
     make_SQL : make_SQL,
     test_if_N_in_sql : test_if_N_in_sql,
     test_if_Ci_in_sql : test_if_Ci_in_sql,
     test_if_Co_in_sql : test_if_Co_in_sql,
     insert_N_sql : insert_N_sql,
     insert_Ci_sql : insert_Ci_sql,
     insert_Co_sql : insert_Co_sql,
     delete_N_sql : delete_N_sql,
     full_query_sql : full_query_sql
 };

min_price = 0;

 //return format: listing_name, listing_url, space, price, city, neigbourhood
 function make_SQL(data){
    if(data.full_query){
        return full_query(data);
    }else{
        var sql_select = `SELECT L.name, L.listing_url, L.price, C.city, N.neigh, H.host_name, H.host_url, L.LISTING_ID`;

        console.log(data);
        if(data.rows != ''){
            var n_rows = data.rows;
        }else{
            var n_rows = 10;
        }
        sql = sql_select + make_from(data) + make_where(data) + ' FETCH FIRST '+ n_rows + ' ROWS ONLY';
        console.log(sql);
        return sql;
    }
 }


 function make_from(data){
    sql_from = ` FROM Listings L, Hosts H, Cities C, Neigh N`;

    //calendar if needed
    if(data.date_from != '' || data.date_to != ''){
       sql_from = sql_from + `, Calendar C`;
    }
    if(data.toilet_paper || data.ethernet_connection || data.fax_machine || data.netflix || data.wine_cooler || data.bidet){
        sql_from = sql_from + ', Amenities_And_Listings AM, Amenities A'
    }
    return sql_from;
 }

 function make_where(data){
    sql_where = ` WHERE L.host_id = H.host_id
    AND N.city_id = C.city_id
    AND L.neigh_id = N.neigh_id`;

    //city choice
    if(data.madrid || data.barcelona || data.berlin){
        if(!data.madrid){
            sql_where = sql_where + " AND C.city != 'madrid'";
        }
        if(!data.barcelona){
            sql_where = sql_where + " AND C.city != 'barcelona'";
        }
        if(!data.berlin){
            sql_where = sql_where + " AND C.city != 'berlin'";
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

    if(data.l_name_search != ''){
        sql_where = sql_where + " AND L.name LIKE '%" + data.l_name_search + "%'";
    }

    //amenitites choices
    if(data.toilet_paper || data.ethernet_connection || data.fax_machine || data.netflix || data.wine_cooler || data.bidet){
        sql_where = sql_where + ' AND AM.amenity_id = A.amenity_id AND L.listing_id = AM.listing_id'
        if(data.toilet_paper){
            sql_where = sql_where + " AND A.amenity = 'Toilet paper'"
        }
        if(data.ethernet_connection){
            sql_where = sql_where + " AND A.amenity = 'Ethernet connection'"
        }
        if(data.fax_machine){
            sql_where = sql_where + " AND A.amenity = 'Fax machine'"
        }
        if(data.netflix){
            sql_where = sql_where + " AND A.amenity = 'Netflix'"
        }
        if(data.wine_cooler){
            sql_where = sql_where + " AND A.amenity = 'Wine cooler'"
        }
        if(data.bidet){
            sql_where = sql_where + " AND A.amenity = 'Bidet'"
        }
    }
    return sql_where;
}

function full_query_sql(data){
    sqls = {}
    id = data.id;

    //query to fetch basic info
    sql_info = `
    SELECT L.name, L.listing_url, H.host_name, H.host_url, C.city, N.neigh, L.review_scores_rating
    FROM LISTINGS L, HOSTS H, NEIGH N, CITIES C
    WHERE L.host_id = H.host_id
      AND L.neigh_id = N.neigh_id
      AND N.city_id = C.city_id
      AND LISTING_ID = ` + id;

    //query to fetch amenities
    sql_am = `
    SELECT A.amenity
    FROM AMENITIES A, AMENITIES_AND_LISTINGS AAL
    WHERE A.amenity_id = AAL.amenity_id
      AND AAL.listing_id = ` + id;

    //query to fetch availabilities
    sql_av = `
    SELECT C.date_calendar
    FROM Calendar C
    WHERE C.available = 't'
      AND C.listing_id = ` + id;

    sqls.base_info = sql_info;
    sqls.amenities_info = sql_am;
    sqls.availabilities_info = sql_av;

    return sqls;
}

function test_if_N_in_sql(neigbourhood){
    sql = `
    SELECT *
    FROM NEIGH N
    WHERE N.neigh = '`
    + neigbourhood + "'"
    return sql;
}
function test_if_Ci_in_sql(city){
    sql = `
    SELECT *
    FROM CITIES C
    WHERE C.city = '`
    + city + "'"
    return sql;
}
function test_if_Co_in_sql(country){
    sql = `
    SELECT *
    FROM COUNTRIES C
    WHERE C.country = '`
    + country + "'"
    return sql;
}

function insert_N_sql(neigbourhood, city){
    sql = `
    INSERT INTO NEIGH (NEIGH_ID, NEIGH, CITY_ID)
    VALUES ((SELECT MAX(NEIGH_ID) FROM NEIGH) + 1,
            '` + neigbourhood + `',
            (SELECT CITY_ID FROM CITIES WHERE CITY = '` + city +`'))`
    return sql;
}
function insert_Ci_sql(city, country){
    sql = `
    INSERT INTO CITIES (CITY_ID, CITY, COUNTRY_ID)
    VALUES ((SELECT MAX(CITY_ID)+1 FROM CITIES) + 1,
             '` + city + `',
            (SELECT COUNTRY_ID FROM COUNTRIES WHERE COUNTRY = '` + country +`'))`
    return sql;
}
function insert_Co_sql(country){
    sql = `
    INSERT INTO COUNTRIES (COUNTRY_ID, COUNTRY, COUNTRY_CODE)
    VALUES ((SELECT MAX(COUNTRY_ID) FROM COUNTRIES) + 1,
             '`+country+`',
              '` + country.charAt(0) + country.charAt(1) + `')`
    return sql;
}
function delete_N_sql(neigbourhood){
    sql = `
    DELETE FROM NEIGH N
    WHERE N.NEIGH = 
    '` + neigbourhood  + `'`;
    return sql;
}