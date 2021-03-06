$(document).ready(function(){

    create_predefined();
    create_options();
    add_ins_del_button_listener();

    //query button handler
    $('#submit').click(function(e){
        e.preventDefault();
        var l_name_search = $('.l_name_search').val();
        var data = {};
        data.l_name_search = l_name_search;
        if(l_name_search == 'bigg yoshi'){
            console.log('bigg yoshi mod activated');
            $('body').css({'background-image': 'url("bigg_yoshi.jpg")'});
        }else{
            set_data(data);
            console.log(data);
            $.ajax({
                type : 'POST',
                url : '/search_query',
                data : JSON.stringify(data),
                contentType : 'application/json',
                success : function(data){
                    display_query(data);
                },
                error(err){
                    $('#query_result').text(err);
                }
            })
        }
    });

    //predefined query button handler
    $('#predefined_holder').find('button').click(function(e){
        e.preventDefault();
        var id = this.id - 1;
        var data = {};
        data.id = id;
        $.ajax({
            type : 'POST',
            url : '/predef_query_info',
            data : JSON.stringify(data),
            contentType : 'application/json',
            success : function(data){
                display_query_info(id, data);
                add_predef_submit_listener();
            },
            error(err){
                $('#query_result').text(err);
            }
        });

    });



    //navigation button
    $('#go_index').click(function(){
        $.ajax({
            type : 'GET',
            url : 'index.html',
            success : function(data){
                window.location.href = '/index.html';
            },
            error(data){
                console.log('problem loading the page');
            }
        })
    });
    $('#go_modif').click(function(){
        $.ajax({
            type : 'GET',
            url : 'modif.html',
            success : function(data){
                document.write(data);
            },
            error(data){
                console.log('problem loading the page');
            }
        })
    });
    $('#go_predef').click(function(){
        $.ajax({
            type : 'GET',
            url : 'predefined.html',
            success : function(data){
                document.write(data);
            },
            error(data){
                console.log('problem loading the page');
            }
        })
    });


    //creates the collapsible
    var coll = $(".collapsible");
    var i;
    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
          content.style.display = "block";
        }
      });
    }

});

//displays the result of a query
function display_query(data){

    $('.query_result').empty();
    let table = $('<table align = center>');
    let headerRow = $('<tr>');
    headerRow.append($(`<th class = 'Rheader'>#</th>`))
    data.metaData.forEach(col => {
        if(col.name == 'NAME'){
            headerRow.append($(`<th class = 'Rheader'>Listing Name</th>`))
        }else if(col.name == 'LISTING_URL'){
            headerRow.append($(`<th class = 'Rheader'>Listing link</th>`))
        }else if(col.name == 'PRICE'){
            headerRow.append($(`<th class = 'Rheader'>Price</th>`))
        }else if(col.name == 'CITY'){
            headerRow.append($(`<th class = 'Rheader'>City</th>`))
        }else if(col.name == 'NEIGH'){
            headerRow.append($(`<th class = 'Rheader'>Neighborhood</th>`))
        }else if(col.name == 'HOST_NAME'){
            headerRow.append($(`<th class = 'Rheader'>Name of the Host</th>`))
        }else if(col.name == 'HOST_URL'){
            headerRow.append($(`<th class = 'Rheader'>Host link</th>`))
        }else if(col.name == 'LISTING_ID'){
            headerRow.append($(`<th class = 'Rheader'>Additional info</th>`))
        }else{
            headerRow.append($(`<th class = 'Rheader'>${col.name}</th>`))
        }
    });
    table.append(headerRow);
    var i = 1;
    data.rows.forEach(row => {
        let jqRow = $(`<tr>`)
        jqRow.append($(`<td>${i}</td>`));
        i++;
        data.metaData.map(col => col.name).forEach(name => {
            if(name == 'LISTING_URL' || name == 'HOST_URL'){
                jqRow.append($(`<td><a href = ${row[name]}>link<a></td>`));
            }else if(name == 'PRICE'){
                jqRow.append($(`<td>${row[name]}$</td>`))
            }else if(name == 'LISTING_ID'){
                jqRow.append($(`<td><button class = "more_info_button" id = ${row[name]}>more info</button></td>`));
            }else{
                jqRow.append($(`<td>${row[name]}</td>`));
            }

        })
        table.append(jqRow)
    })
    $('.query_result').append(table);

    var perf = data.perf;

    $('.execution_time').text('execution time: ' + Math.trunc(perf) + 'ms');
    add_more_info_button_listener();
}

//displays the title and sql text of asked predefined query
function display_query_info(id, data){
    $('.query_result').empty();
    $('.execution_time').empty();
    holder = $('<div>');
    holder.append("<p id = title> title: " + data.title + "</p>");
    holder.append('<br>');
    holder.append("<p id = sql> SQL: " + data.sql + "</p>");
    if(id == 0){
        holder.append('number of beds: <input type = number id = bed_N>');
    }
    $('.query_result').append(holder);
    $('.query_result').append('<button id = '+id+' class = predef_submit_button> Go </button>');
}

//add info on data to be sent on server for the query
function set_data(data){
    data.madrid = $('input[id = "Madrid"]').is(':checked');
    data.barcelona = $('input[id = "Barcelona"]').is(':checked');
    data.berlin = $('input[id = "Berlin"]').is(':checked');
    data.date_from = $('input[id = "date_from"]').val();
    data.date_to = $('input[id = "date_to"]').val();
    data.price_from = $('input[id = "price_from"]').val();
    data.price_to = $('input[id = "price_to"]').val();
    data.toilet_paper = $('input[id = "Toilet"]').is(':checked');
    data.ethernet_connection = $('input[id = "Ethernet"]').is(':checked');
    data.fax_machine = $('input[id = "Fax"]').is(':checked');
    data.netflix = $('input[id = "Netflix"]').is(':checked');
    data.wine_cooler = $('input[id = "Wine"]').is(':checked');
    data.bidet = $('input[id = "Bidet"]').is(':checked');
    data.rows = $('input[id = "rows"]').val();
}

//creates the predefined buttons set
function create_predefined(){
    holder = $('#predefined_holder')
    holder_1 = $('<ul>');
    var i;
    for(i=1; i<=22; i++){
        if(i<11){
            holder_1.append("<li><button class = 'predef_info_button_2' id = " + i + "> Querry 2." +i+"</button></li>");
        }else{
            holder_1.append("<li><button class = 'predef_info_button_3' id = " + i + "> Querry 3." +(i-10)+"</button></li>");
        }
    }
    holder.append(holder_1);
}

//adds the listener to the go button for the predefined queries
function add_predef_submit_listener(){
    $('.predef_submit_button').click(function(e){
        e.preventDefault();
        var id = this.id;
        var data = {};
        data.id = id;
        if(id == 0){
            data.bed_N = $('#bed_N').val()
            console.log($('#bed_N').val())
        }
        $.ajax({
            type : 'POST',
            url : '/predef_query',
            data : JSON.stringify(data),
            contentType : 'application/json',
            success : function(data){
                display_query(data);
            },
            error(err){
                $('.query_result').text(err);
            }
        });

    });    
}

//adds the listener to the more info buttons
function add_more_info_button_listener(){
    $('.more_info_button').click(function(e){
        e.preventDefault();
        var id = this.id;
        var data = {};
        data.id = id;
        console.log('more info button clicked');
        $.ajax({
            type : 'POST',
            url : '/full_query',
            data : JSON.stringify(data),
            contentType : 'application/json',
            success : function(data){
                console.log(data);
                display_query(data.base_info);
                display_amenities(data.amenities_info);
                display_availabilities(data.availabilities_info);
            },
            error(err){
                $('.query_result').text(err);
            }
        });
    });    
}

//creates the collapsible options
function create_options(){
    //cities selection
    var cities = ['Madrid', 'Barcelona', 'Berlin'];

    $('#options_holder').append(`<ul><b><u>City<u><b><ul>`);
    cities.forEach(el => {
        $('#options_holder').append(`<li><input type = "checkbox" id = ${el}>${el}</li><br>`);
    });
    //date availability
    $('#options_holder').append(`<ul><b><u>Availability<u><b><ul>`);
    $('#options_holder').append(`<li>From:<input type = date id = date_from class = date_input> </li> 
        <li>To: <input type = date id = date_to class = date_input></li>`);
    //price selection
    $('#options_holder').append(`<ul><b><u>Price<u><b></ul>`);
    $('#options_holder').append(`<li>From: <input type = number id = price_from min = "0" class = price_input> </li>
        <li>To: <input type = number id = price_to min = "0" class = price_input></li>`);
    //amenities selection
    var amenities = ['Toilet paper', 'Ethernet connection', 'Fax machine', 'Netflix', 'Wine cooler', 'Bidet'];
    $('#options_holder').append(`<ul><b><u>Amenities<u><b></ul>`);
    amenities.forEach(el => {
        $('#options_holder').append(`<li><input type = "checkbox" id = ${el}>${el}</li><br>`);
    });
    $('#options_holder').append(`<li>number of results: <input type = "number" id = rows></li>`)
}

function add_ins_del_button_listener(){
    $('#ins_N_submit').click(function(e){
        $('#done').text('inerting...');
        e.preventDefault();
        var data = {};
        var N =  $('#ins_N_input').val();
        var Ci = $('#ins_Ci_input').val();
        var Co = $('#ins_Co_input').val();
        data.N_to_insert = N
        data.Ci_to_insert = Ci
        data.Co_to_insert = Co
        $.ajax({
            type : 'POST',
            url : '/insert_neighborhood',
            data : JSON.stringify(data),
            contentType : 'application/json',
            success : function(data){
                $('#done').text('done');
            },
            error(err){
                $('#done').text(err)
            }
        });
    });
    $('#del_N_submit').click(function(e){
        $('#done').text('deleting...');
        e.preventDefault();
        var data = {};
        data.N_to_delete = $('#del_N_input').val();
        $.ajax({
            type : 'POST',
            url : '/delete_neighborhood',
            data : JSON.stringify(data),
            contentType : 'application/json',
            success : function(data){
                $('#done').text('done');
            },
            error(err){
                $('#done').text(err);
            }
        });
    });
}

function display_amenities(amenities){
    var amenities_holder = $('<ul class = list_holder id = amenities_holder>');
    amenities_holder.append('<ul class = list_holder>' + 'AMENITIES')
    amenities.rows.forEach(am => {
        amenities_holder.append('<li align = left>' + am.AMENITY );
    });
    $('.query_result').append(amenities_holder);
}

function display_availabilities(availabilities){
    var availabilities_holder = $('<ul class = list_holder id = availabilities_holder>');
    availabilities_holder.append('<ul class = list_holder>' + 'DATE AVAILABLE')
    availabilities.rows.forEach(av => {
        availabilities_holder.append('<li align = left>' + av.DATE_CALENDAR);
    });
    $('.query_result').append(availabilities_holder);
}