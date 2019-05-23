$(document).ready(function(){

    create_predefined();
    create_options();

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
                url : '/special_query',
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
    $('.predef_info_button').click(function(e){
        e.preventDefault();
        console.log('info button pressed');
        var id = this.id;
        console.log('id sent: ' + id);
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
    //predef



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
    console.log(data);
    let table = $('<table align = center>');
    let headerRow = $('<tr>');
    data.metaData.forEach(col => headerRow.append($(`<th id = 'Rheader'>${col.name}</th>`)));
    table.append(headerRow);
    data.rows.forEach(row => {
        let jqRow = $(`<tr>`)
        data.metaData.map(col => col.name).forEach(name => {
            if(name == 'LISTING_URL' || name == 'HOST_URL'){
                jqRow.append($(`<td><a href = ${row[name]}>link<a></td>`));
            }else if(name == 'PRICE'){
                jqRow.append($(`<td>${row[name]}$</td>`))
            }else{
                jqRow.append($(`<td>${row[name]}</td>`));
            }

        })
        table.append(jqRow)
    })
    $('.query_result').append(table);

    var perf = data.perf;

    $('.execution_time').text('execution time: ' + Math.trunc(perf) + 'ms');
}

//displays the title and sql text of asked predefined query
function display_query_info(id, data){
    $('.query_result').empty();
    $('.execution_time').empty();
    console.log(data);
    holder = $('<div>');
    holder.append("<p id = title> title: " + data.title + "</p>");
    holder.append('<br>');
    holder.append("<p id = sql> SQL: " + data.sql + "</p>");
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
    for(i=1; i<=12; i++){
        holder_1.append("<li><button class = 'predef_info_button' id = " + i + "> Querry" +i+"</button></li>");
    }
    holder.append(holder_1);
}

//adds the listener to the go button for the predefined queries
function add_predef_submit_listener(){
    $('.predef_submit_button').click(function(e){
        e.preventDefault();
        console.log('button pressed');
        var id = this.id;
        console.log('id sent: ' + id);
        var data = {};
        data.id = id;
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
    $('#options_holder').append(`<li>number of rows: <input type = "number" id = rows></li>`)
}