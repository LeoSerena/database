$(document).ready(function(){

    $('#submit_button').click(function(e){
        e.preventDefault();
        var query;

        query = $('#query_input').val();
        console.log("query sended: " + query);

        var data = {};
        data.query = query;

        $.ajax({
            type : 'POST',
            url : '/special_query',
            data : JSON.stringify(data),
            contentType : 'application/json',
            success : function(data){
                console.log('data: ' + data);
                $('#query_result').text(data);
            },
            error(err){
                $('#query_result').text(err);
            }
        })
    });

    $('#predef_query').click(function(e){
        e.preventDefault();

        var id;
        id = $('#query_input').val();
        if(id < 1 || id > 22){
            $('#query_result').text('The id range is between 1 and 25');
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
                    var res = JSON.parse(data);
                    console.log(res[metadata]);
                    $('#metadata').text("");
                    $('#query_result').text(data);
                },
                error(err){
                    $('#query_result').text(err);
                }
            });
    }
    })
});