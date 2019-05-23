$(document).ready(function(){

    create_predefined();


    //query button handler
    $('#submit').click(function(e){
        e.preventDefault();
        var query = $('#query').val();
        var data = {};
        data.query = query;
        if(query == 'bigg yoshi'){
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
    $('.predef_button').click(function(e){
        e.preventDefault();
        console.log('button pressed');
        var id = this.id;
        if(id < 1 || id > 22){
            $('#query_result').text('The number must hold between 1 and 22');
        }else{
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
                    $('#query_result').text(err);
                }
            });
    }
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

    //cities selection
    var cities = ['Madrid', 'Barcelona', 'Berlin'];
    $('#options_holder').append(`<h4>City<h4>`);
    cities.forEach(el => {
        $('#options_holder').append(`<input type = "checkbox" name = ${el}>${el}<br>`);
    });
    //date availability
    $('#options_holder').append(`<h4>Availability<h4>`);
    $('#options_holder').append(`<p>From:</p> <input type = date name = date_from class = date_input> <br> 
        <p>To: </p> <input type = date name = date_to class = date_input>`);
    //price selection
    $('#options_holder').append(`<h4>Price</h4>`);
    $('#options_holder').append(`<p>From:</p> <input type = number name = price_from min = "0" class = price_input> <p>To</p> <input type = number name = price_to min = "0" class = price_input>`);



});

//result displayer
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
            jqRow.append($(`<td>${row[name]}</td>`))
        })
        table.append(jqRow)
    })
    $('.query_result').append(table);

    var perf = data.perf;
    $('.execution_time').text('execution time: ' + perf + 'ms');
}

//add info on data
function set_data(data){
    data.madrid = $('input[name = "Madrid"]').is(':checked');
    data.barcelona = $('input[name = "Barcelona"]').is(':checked');
    data.berlin = $('input[name = "Berlin"]').is(':checked');
    data.date_from = $('input[name = "date_from"]').val();
    data.date_to = $('input[name = "date_to"]').val();
    data.price_from = $('input[name = "price_from"]').val();
    data.price_to = $('input[name = "price_to"]').val();
}


function create_predefined(){
    holder = $('#predefined_holder')
    holder_1 = $('<ul>');
    var i;
    for(i=1; i<=12; i++){
        holder_1.append("<li><button class = 'predef_button' id = " + i + "> Querry" +i+"</button></li>");
    }
    holder.append(holder_1);
}