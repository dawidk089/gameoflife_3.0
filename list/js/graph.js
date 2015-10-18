/**
 * obiekt wspierajacy rysowanie wykresu (nie dziala)
 */
grapher = {
    x_amount: undefined,
    y_amount: undefined,
    data_board: undefined,
    c: undefined,

    x_size: 100,
    y_size: 75,
    offset: 5,
    font: 12,



    get_point: function() {
        var id = $(this).find("input[type='hidden']").attr('value');

        $.ajax(appl_path + "SimList/draw_graph", {
            type: "POST",
            data: {
                'id': id
            },
            statusCode: {
                404: function () {
                    console.error("[404]");
                },
                200: function () {
                    console.error("[200]");
                },
                0: function () {
                    console.error("[000]");
                }
            }
        }).done(grapher.draw)
    },

    draw: function(data_json){
        this.data_board = JSON.parse(data_json);
        this.x_amount = this.data_board.length;
        this.y_amount = Math.max.apply(null, this.data_board);
        console.log('data lenght: ', this.x_amount);
        console.log('data lenght: ', this.y_amount);

        this.init();

    },

    init: function(div_id){
        var canvas_init_text = '\
        <canvas id="game_canvas"  \
        width="' + grapher.x_size + '" \
        height="' + grapher.y_size + '"> \
        <p>Twoja przeglądarka nie obsługuje canvas.</p> \
        </canvas>';

        document.getElementById(div_id).innerHTML = canvas_init_text;
        this.c = document.getElementById('game_canvas').getContext('2d');

        this.c.font = String(this.font)+"px Arial";
        this.c.fillText("Hello World",10,50);


    }


};