
const queries = [
    {
        id : 1,
        title : "What is	the	average	price for a listing	with 8 bedrooms?",
        sql : ` SELECT AVG(L.price)
                FROM listings L
                WHERE L.bedrooms = 8`
    },
    {
        id : 2,
        title : "What	is	the	average	cleaning	review	score	for	listings	with	TV?",
        sql : `SELECT AVG(L.review_scores_cleanliness)
        FROM Listings L, amenities_and_listings A_L, amenities AM
        WHERE (A_L.amenity_id = AM.amenity_id)
          AND (A_L.listing_id = L.listing_id) 
          AND (AM.amenity = 'TV')`
    },
    {
        id : 3,
        title : "Print	all	the	hosts	who	have	an	available	property	between	date	03.2019	and	09.2019",
        sql : `SELECT DISTINCT(H.HOST_NAME)
        FROM hosts H, listings L, CALENDAR C
        WHERE H.host_id = L.host_id
            AND C.listing_id = L.listing_id
            AND C.available = 't'
            AND C.date_calendar > TO_DATE('2019-03-01','yyyy-mm-dd')
            AND C.date_calendar < TO_DATE('2019-09-01','yyyy-mm-dd')`
    },
    {
        id : 4,
        title : "Print	how	many	listing	items	exist	that	are	posted	by	two	different	hosts	but	the	hosts	have	the	same	name.",
        sql : `SELECT COUNT(L.LISTING_ID)
        FROM Listings L
        WHERE L.HOST_ID IN
          ((SELECT DISTINCT H1.host_id
          FROM Hosts H1, Hosts H2
          WHERE H1.host_id < H2.host_id AND H1.host_name = H2.host_name))` 
    },
    {
        id : 5,
        title : "Print	all	the	dates	that	'Viajes	Eco'	has	available	accommodations	for	rent.",
        sql : `SELECT C.DATE_CALENDAR
        FROM CALENDAR C, HOSTS H, LISTINGS L
        WHERE H.HOST_ID = L.HOST_ID
          AND L.LISTING_ID = C.LISTING_ID
          AND H.host_name = 'Viajes Eco'`
    },
    {   
        id : 6,
        title : "Find	all	the	hosts	(host_ids,	host_names)	that	have	only	one	listing.",
        sql : `SELECT HOST_NAME FROM 
        (SELECT H.HOST_NAME, COUNT(L.LISTING_ID) AS coconut
        FROM HOSTS H, LISTINGS L
        WHERE H.HOST_ID = L.HOST_ID
        GROUP BY H.HOST_NAME)
        WHERE coconut = 1`
    },
    {   
        id : 7,
        title : "What	is	the	difference	in	the	average	price	of	listings	with	and	without	Wifi.",
        sql : `SELECT AVG(L1.PRICE)-AVG(L2.PRICE) AS DIFF_AVG_WITH_AND_WITHOUT_WIFI
        FROM LISTINGS L1, LISTINGS L2, AMENITIES_AND_LISTINGS AAL, AMENITIES A
        WHERE A.AMENITY='Wifi' AND A.AMENITY_ID=AAL.AMENITY_ID
          AND AAL.LISTING_ID=L1.LISTING_ID AND
          L2.LISTING_ID NOT IN (  SELECT AAL.LISTING_ID
                                  FROM AMENITIES_AND_LISTINGS AAL, AMENITIES A
                                  WHERE A.AMENITY='Wifi' AND A.AMENITY_ID=AAL.AMENITY_ID)`
    },
    {   
        id : 8,
        title : " How	much	more	(or	less)	costly	to	rent	a	room	with	8	beds	in	Berlin	compared	to	Madrid	on	average",
        sql : `SELECT  AVG(L1.PRICE)-AVG(L2.PRICE) AS DIFF_AVG_8BEDS_BER_MAD
        FROM LISTINGS L1, LISTINGS L2, NEIGH N1, CITIES C1, NEIGH N2, CITIES C2
        WHERE L1.BEDS=8 AND L2.BEDS=8 AND
          L1.NEIGH_ID=N1.NEIGH_ID AND N1.CITY_ID=C1.CITY_ID AND C1.CITY='berlin' AND
          L2.NEIGH_ID=N2.NEIGH_ID AND N2.CITY_ID=C2.CITY_ID AND C2.CITY='madrid'`
    },
    {
        id : 9,
        title : "Find	the	top-10	(in	terms	of	the	number	of	listings)	hosts	(host_ids,	host_names)	in	Spain.",
        sql : `SELECT H.host_id, H.host_name, COUNT(L.listing_id)
        FROM HOSTS H,LISTINGS L, NEIGH N, CITIES C, COUNTRIES CO
        WHERE L.neigh_id = N.neigh_id AND N.city_id = C.city_id 
        AND C.country_id = CO.country_id AND CO.country = 'Spain'
        AND H.HOST_ID = L.HOST_ID
        GROUP BY H.host_id,H.host_name
        ORDER BY COUNT(L.listing_id) DESC
        FETCH FIRST 10 ROWS ONLY`
    },
    {   
        id : 10,
        title : "Find	the	top-10	rated	(review_score_rating)	apartments	(id,name)	in	Barcelona.",
        sql : `SELECT L.listing_id AS id, L.name, L.review_scores_rating
        FROM listings L, neigh N, cities C
        WHERE review_scores_rating IS NOT NULL AND L.neigh_id = N.neigh_id
        AND N.city_id = C.city_id and C.CITY = 'barcelona'
        ORDER BY review_scores_rating DESC
        FETCH FIRST 10 ROWS ONLY`
    },
    {
        id : 11,
        title : "Print how many hosts in each city have declared the area of their property in square meters. Sort the output based on the city name in ascending order.",
        sql : `SELECT City.city, COUNT(H.HOST_ID)
        FROM HOSTS H, LISTINGS L, NEIGH N, CITIES City
        WHERE H.host_id = L.host_id
          AND L.SQUARE_FEET IS NOT NULL
          AND H.NEIGH_ID = N.NEIGH_ID
          AND N.city_id = City.city_id
          GROUP BY City
          ORDER BY City`
    },
    {
        id : 12,
        title : "The quality of a neighborhood is defined based on the number of listings and the review score of these listings, one way for computing that is using the median of the review scores, as medians are more robust to outliers. Find the top-5 neighborhoods using median review scores (review_scores_rating) of listings in Madrid. Note: Implement the median operator on your own, and do not use the available built-in operator.",
        sql : `SELECT DISTINCT PERCENTILE_DISC(0.5) WITHIN GROUP(ORDER BY L.REVIEW_SCORES_RATING) OVER (PARTITION BY L.NEIGH_ID) AS MEDIAN, L.NEIGH_ID
        FROM LISTINGS L, NEIGH N, CITIES C
        WHERE L.NEIGH_ID=N.NEIGH_ID AND N.CITY_ID=C.CITY_ID AND C.CITY='madrid'
        ORDER BY MEDIAN DESC
        FETCH FIRST 5 ROWS ONLY`
    },
    {
        id : 13,
        title : "Find all the hosts (host_ids, host_names) with the highest number of listings.",
        sql : `SELECT hosts_by_count.host_id, hosts_by_count.host_name, hosts_by_count.counts
        FROM
            (SELECT H.host_id, H.host_name, COUNT(L.listing_id) as counts
            FROM HOSTS H,LISTINGS L
            WHERE H.HOST_ID = L.HOST_ID
            GROUP BY H.host_id,H.host_name
            ORDER BY COUNT(L.listing_id) DESC) hosts_by_count,
            (SELECT max(t.counts) as max_val
            FROM
                (SELECT H.host_id, COUNT(L.listing_id) as counts
                FROM HOSTS H,LISTINGS L
                WHERE H.HOST_ID = L.HOST_ID
                GROUP BY H.host_id,H.host_name
                )
             t ) max_count
        WHERE hosts_by_count.counts = max_count.max_val`
    },
    {
        id : 14,
        title : "Find the 5 most cheapest Apartments (based on average price within the available dates) in Berlin available for at least one day between 01-03-2019 and 30-04-2019 having at least 2 beds, a location review score of at least 8, flexible cancellation, and listed by a host with a verifiable government id. ",
        sql : `SELECT DISTINCT(L.LISTING_ID) AS ID, AVG(C.PRICE)
        FROM LISTINGS L, PROPERTY_TYPES PT, NEIGH N, CITIES City, CALENDAR C, CANCELLATION_POLICIES CP, HOSTS H, HOST_VERIF_AND_HOST HVH, HOST_VERIFICATIONS HV
        WHERE L.PROPERTY_TYPE_ID = PT.PROPERTY_TYPE_ID
          AND PT.PROPERTY_TYPE = 'Apartment'
          AND N.NEIGH_ID = L.NEIGH_ID
          AND N.CITY_ID = City.CITY_ID
          AND City.CITY = 'berlin'
          AND C.LISTING_ID = L.LISTING_ID
          AND C.DATE_CALENDAR > TO_DATE('2019-03-01','yyyy-mm-dd')
          AND C.DATE_CALENDAR < TO_DATE('2019-09-01','yyyy-mm-dd')
          AND C.price IS NOT NULL
          AND L.BEDS > 2
          AND L.REVIEW_SCORES_LOCATION >= 8
          AND CP.CANCELLATION_POLICY_ID = L.CANCELLATION_POLICY_ID
          AND CP.CANCELLATION_POLICY = 'flexible'
          AND L.HOST_ID = H.HOST_ID
          AND H.HOST_ID = HVH.HOST_ID
          AND HVH.HOST_VERIFICATION_ID = HV.HOST_VERIFICATION_ID
          AND HV.HOST_VERIFICATION = ' government_id'
          GROUP BY L.LISTING_ID
          ORDER BY AVG(C.price)
        FETCH FIRST 5 ROWS ONLY`
    },
    {
        id : 15,
        title : "Each property can accommodate different number of people (1 to 16).  Find the top-5 rated (review_score_rating) listings for each distinct category based on number of accommodated guests with at least two of these facilities: Wifi, Internet, TV, and Free street parking. ",
        sql : `WITH temp AS(
            SELECT L.name, L.accommodates, L.review_scores_rating
            FROM Listings L, AMENITIES A1, AMENITIES A2, AMENITIES_AND_LISTINGS A_A_L1, AMENITIES_AND_LISTINGS A_A_L2
            WHERE L.listing_id = A_A_L1.listing_id
              AND L.listing_id = A_A_L2.listing_id
              AND A_A_L1.amenity_id = A1.amenity_id
              AND A_A_L2.amenity_id = A2.amenity_id
              AND ((A1.amenity = 'Wifi' AND A2.amenity = 'Internet') 
                    OR (A1.amenity = 'Wifi' AND A2.amenity = 'TV') 
                    OR (A1.amenity = 'Internet' AND A2.amenity = 'TV')) )
          
          SELECT 
            NAME, ACCOMMODATES, REVIEW_SCORES_RATING
          FROM 
            (SELECT 
              L.name, L.Accommodates, L.review_scores_rating, ROW_NUMBER() OVER (PARTITION BY L.Accommodates ORDER BY L.Review_scores_rating DESC) rank
            FROM
              temp L
            WHERE 
              L.REVIEW_SCORES_RATING IS NOT NULL)
          WHERE
              RANK < 6;`
    },
    {
        id : 16,
        title : "What are top three busiest listings per host? The more reviews a listing has, the busier the listing is.",
        sql : `SELECT t2.host_id, t2.name, t2.rev_counts, t2.top_n
        FROM
        (SELECT t.host_id,t.listing_id,t.rev_counts , row_number() over (partition by t.host_id ORDER BY t.rev_counts DESC) as top_n
        FROM
        (SELECT L.host_id,L.listing_id, COUNT(R.review_id) as rev_counts
        FROM Listings L, Reviews R
        WHERE L.listing_id = R.listing_id
        GROUP BY L.host_id,L.listing_id
        ORDER BY COUNT(L.listing_id) DESC) t ) t2
        WHERE t2.top_n <= 3 FETCH FIRST 20 ROWS ONLY`
    },
    {
        id : 17,
        title : "What are the three most frequently used amenities at each neighborhood in Berlin for the listings with “Private Room” room type? ",
        sql : ``
    },
    {
        id : 18,
        title : "What is the difference in the average communication review score of the host who has the most diverse way of verifications and of the host who has the least diverse way of verifications. In case of a multiple number of the most or the least diverse verifying hosts, pick a host one from the most and one from the least verifying hosts. ",
        sql : `SELECT AVG(L1.REVIEW_SCORES_COMMUNICATION)-AVG(L2.REVIEW_SCORES_COMMUNICATION)
        FROM LISTINGS L1, (SELECT LIST_COUNT_MAX.HOST_ID
                          FROM (SELECT COUNT(*), HVAH.HOST_ID
                                FROM HOST_VERIF_AND_HOST HVAH
                                GROUP BY HVAH.HOST_ID
                                ORDER BY COUNT(*) DESC) LIST_COUNT_MAX
                          WHERE ROWNUM = 1) MAX_VERIF_HOST,
             LISTINGS L2, (SELECT LIST_COUNT_MIN.HOST_ID
                          FROM (SELECT COUNT(*), HVAH.HOST_ID
                                FROM HOST_VERIF_AND_HOST HVAH
                                GROUP BY HVAH.HOST_ID
                                ORDER BY COUNT(*)) LIST_COUNT_MIN
                          WHERE ROWNUM = 1) MIN_VERIF_HOST
        WHERE L1.HOST_ID = MAX_VERIF_HOST.HOST_ID AND
              L2.HOST_ID = MIN_VERIF_HOST.HOST_ID`
    },
    {
        id : 19,
        title : "What is the city who has the highest number of reviews for the room types whose average number of accommodates are greater than 3. ",
        sql : `SELECT t.city, sum(t.rev_counts) as count_per_city
        FROM
        
        (SELECT L2.listing_id,L2.name, C.city, count(R.review_id) as rev_counts
        FROM Neigh N, Cities C, Reviews R,
        
        (SELECT L.listing_id,L.name,L.room_type_id, L.neigh_id
        FROM Listings L
        WHERE L.room_type_id IN
        (SELECT t.room_type_id
        FROM
        (SELECT L.room_type_id, R.room_type,AVG(L.accommodates) as avg_accommodates
        FROM Listings L, Room_types R
        WHERE L.room_type_id = R.room_type_id
        GROUP BY L.room_type_id, R.room_type) t
        WHERE t.avg_accommodates > 3)) L2
        
        WHERE L2.listing_id = R.listing_id AND L2.neigh_id = N.neigh_id
        AND N.city_id = C.city_id
        GROUP BY L2.listing_id,L2.name, C.city) t
        GROUP BY t.city
        ORDER BY count_per_city DESC
        FETCH FIRST ROW ONLY`
    },
    {
        id : 20,
        title : "Print all the neighborhoods in Madrid which have at least 50 percent of their listings occupied in year 2019 and their host has joined airbnb before 01.06.2017 ",
        sql : ``
    },
    {
        id : 21,
        title : "Print all the countries that in 2018 had at least 20% of their listings available. ",
        sql : `
        SELECT ALL_TAB.COUNTRY, AV_TAB.NUM_AVAIL_LIST_IN_2018/ALL_TAB.NUM_LIST_IN_2018 AS RATIO
FROM (  SELECT COUNT(DISTINCT L.LISTING_ID) AS NUM_LIST_IN_2018, CTRI.COUNTRY
        FROM CALENDAR C 
          JOIN LISTINGS L ON C.LISTING_ID=L.LISTING_ID
          JOIN NEIGH N ON L.NEIGH_ID=N.NEIGH_ID
          JOIN CITIES CIT ON N.CITY_ID=CIT.CITY_ID
          JOIN COUNTRIES CTRI ON CIT.COUNTRY_ID=CTRI.COUNTRY_ID
        WHERE C.DATE_CALENDAR > TO_DATE('2018-01-01','yyyy-mm-dd')
          AND C.DATE_CALENDAR < TO_DATE('2018-12-31','yyyy-mm-dd')
        GROUP BY CTRI.COUNTRY) ALL_TAB
        JOIN
    ( SELECT COUNT(DISTINCT L.LISTING_ID) AS NUM_AVAIL_LIST_IN_2018, CTRI.COUNTRY
      FROM CALENDAR C 
        JOIN LISTINGS L ON C.LISTING_ID=L.LISTING_ID
        JOIN NEIGH N ON L.NEIGH_ID=N.NEIGH_ID
        JOIN CITIES CIT ON N.CITY_ID=CIT.CITY_ID
        JOIN COUNTRIES CTRI ON CIT.COUNTRY_ID=CTRI.COUNTRY_ID
        WHERE C.DATE_CALENDAR > TO_DATE('2018-01-01','yyyy-mm-dd')
          AND C.DATE_CALENDAR < TO_DATE('2018-12-31','yyyy-mm-dd')
        AND C.AVAILABLE='t'
      GROUP BY CTRI.COUNTRY) AV_TAB ON ALL_TAB.COUNTRY=AV_TAB.COUNTRY
WHERE AV_TAB.NUM_AVAIL_LIST_IN_2018/ALL_TAB.NUM_LIST_IN_2018>=0.2`
    },
    {
        id : 22,
        title : "Print all the neighborhouds in Barcelona where more than 5 percent of their accommodation’s cancelation policy is strict with grace period. ",
        sql : `SELECT strict_cp.neigh_id,strict_cp.neigh,
        strict_cp.strict_count, all_cp.all_count
        FROM 
        (SELECT  N.neigh_id,N.neigh, C.city, count(CP.cancellation_policy) as strict_count
        FROM listings L, neigh N, cities C, cancellation_policies CP
        WHERE L.neigh_id = N.neigh_id AND N.city_id = C.city_id 
        AND L.cancellation_policy_id = CP.cancellation_policy_id
        AND C.CITY = 'barcelona'
        AND CP.cancellation_policy = 'strict_14_with_grace_period'
        GROUP BY N.neigh_id, N.neigh, C.city) strict_cp,
        (SELECT  N.neigh_id,N.neigh, C.city, count(CP.cancellation_policy) as all_count
        FROM listings L, neigh N, cities C, cancellation_policies CP
        WHERE L.neigh_id = N.neigh_id AND N.city_id = C.city_id 
        AND L.cancellation_policy_id = CP.cancellation_policy_id
        AND C.CITY = 'barcelona'
        GROUP BY N.neigh_id, N.neigh, C.city) all_cp
        WHERE
        strict_cp.neigh_id = all_cp.neigh_id
        AND (strict_cp.strict_count/all_cp.all_count) >= 0.05`
    }
]

function get_predef_info(res, id){
    result = {};
    result.title = queries[id].title;
    result.sql = queries[id].sql;
    res.send(result);
}

module.exports = {
    predef_queries : queries,
    get_predef_info : get_predef_info
};
