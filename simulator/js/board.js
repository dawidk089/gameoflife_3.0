/**
 * obiekt odpowiedzialny za plansze z gra w zycie
 */
board = {

    //OBJECT FIELDS
    c: undefined, //context canvas
    pos_tab: null, //tablica pozycji komorek na plachcie canvas
    cell_radius: null, //promien komorki
    canvas_h: undefined,
    canvas_w: undefined, //wymiary canvas (bez skalowania)
    prescaler: undefined, //dzielnik; skalowanie canvas do div'a;
    //wymagany przy rozpoznaniu pozycji wskaznika na komorce
    cell_padding: null, //odsuniecie od innyc komorek
    size_i: 0,
    size_j: 0, //ilosc komorek poziomo/pionowo
    cells: [], //komorki -- obiekty
    canvas_id: undefined,
    is_clear: true,

    //OBJECT METHODS

    /**
     * motada ktora z ustawien poczatkowych planszy inicjuje zbior obiektow komorek (cells)
     */
    init_cells: function () {
        var is_clear = true;
        board.cells = [];
        if(info.current_step === undefined)
            info.current_step = 0;
        for (var i = 0; i < board.size_i; i++) {
            var row = [];
            for (var j = 0; j < board.size_j; j++)
                if(board.pos_tab[i][j]['state'] == 'live') {
                    row.push(new Cell(true, i, j));
                    is_clear = false;
                }
                else if(this.pos_tab[i][j]['state'] == 'dead')
                    row.push(new Cell(false, i, j));
            board.cells.push(row);
        }

        return !is_clear;
    },

    /**
     * przenosi wlasnosci zbioru obiektow komorek (cells) na plansze
     */
    set_cells: function(){
        for (var i = 0; i < this.size_i; i++)
            for (var j = 0; j < this.size_j; j++) {
                if(this.cells[i][j].is_alive == true)
                    this.set_field(i, j, 'live');
                else if(this.cells[i][j].is_alive == false)
                    this.set_field(i, j, 'dead');
            }

    },
    /**
     * wspiera obliczanie sasiadow zadanej komorki
     * @param x
     * @param y -- id's komorki
     * @returns {number} -- liczba sasiadow
     */
    numberOfNeightbour: function(x, y) {

        var alive = 0;
        if (this.cells[x][y - 1] != undefined && this.cells[x][y - 1].is_alive)
            ++alive;
        if (this.cells[x][y + 1] != undefined && this.cells[x][y + 1].is_alive)
            ++alive;
        if (this.cells[x - 1] != undefined && this.cells[x - 1][y] != undefined && this.cells[x - 1][y].is_alive)
            ++alive;
        if (this.cells[x + 1] != undefined && this.cells[x + 1][y] != undefined && this.cells[x + 1][y].is_alive)
            ++alive;
        if (this.cells[x - 1] != undefined && this.cells[x - 1][y - 1] != undefined && this.cells[x - 1][y - 1].is_alive)
            ++alive;
        if (this.cells[x + 1] != undefined && this.cells[x + 1][y - 1] != undefined && this.cells[x + 1][y - 1].is_alive)
            ++alive;
        if (this.cells[x - 1] != undefined && this.cells[x - 1][y + 1] != undefined && this.cells[x - 1][y + 1].is_alive)
            ++alive;
        if (this.cells[x + 1] != undefined && this.cells[x + 1][y + 1] != undefined && this.cells[x + 1][y + 1].is_alive)
            ++alive;
        return alive;
    },
    /**
     * wspiera rysowanie komorek na canvasie
     * @param i
     * @param j -- pozycja porzadkowa na planszy canvas
     * @param state -- stan komorki: zywa/martwa
     */
    set_field: function(i, j, state){

        var x = this.pos_tab[i][j]['x'];
        var y = this.pos_tab[i][j]['y'];

        this.c.strokeStyle = 'black';

        if(state == 'dead')
            this.c.fillStyle = '#222';
        else if(state == 'live')
            this.c.fillStyle = '#f60';
        this.c.beginPath();
        this.c.arc(x, y, this.cell_radius, 0, Math.PI * 2, false);
        this.c.closePath();
        this.c.stroke();
        this.c.fill();

        this.pos_tab[i][j]['state'] = state;
    },

    /**
     * definicja funkcji, która ma wprowadzić zmiany po kliknięciu na komórke w planszy;
     * zmienia komorke w stan przeciwny (zywa->martwa, martwa->zywa)
     * wykorzystuje wykrywanie pozycji wskaznika wzgledem planszy canvas
     * sprawdza czy i na ktorej komorce znajduje sie wskaznik w trakcie klikniecia
     */
    set_cell_event: function(event) {

        var x = (event.layerX - board.canvas_id.offsetLeft)*board.prescaler, // - elemLeft,
            y = (event.layerY - board.canvas_id.offsetTop)*board.prescaler; // - elemTop;

        for (var i=0; i<board.pos_tab.length; i++) {
            for (var j = 0; j < board.pos_tab[i].length; j++) {

                var x_c = board.pos_tab[i][j]['x'];
                var y_c = board.pos_tab[i][j]['y'];
                var r_c = board.cell_radius;
                var state_c = board.pos_tab[i][j]['state'];

                if (Math.abs(x - x_c) < +board.cell_padding+r_c && Math.abs(y - y_c) < board.cell_padding+r_c) {
                    if(state_c=='dead')
                        board.set_field(i, j, 'live');
                    else if(state_c=='live')
                        board.set_field(i, j, 'dead');
                    break;
                }
            }
        }
    },

    /**
     * metoda wstawiajaca canvas o proporcjonalnych wymiarach;
     * wylicza wymiary canvas, wstawia tag canvas w html, pobiera context;
     */
    drawing: function() {

        board.canvas_w = 2*(board.cell_radius+board.cell_padding)*parseInt($("#horizontal_amount").val());
        board.canvas_h = 2*(board.cell_radius+board.cell_padding)*parseInt($("#vertical_amount").val());


        var canvas_init_text = '\
        <canvas id="game_canvas"  \
        width="' + board.canvas_w + '" \
        height="' + board.canvas_h + '"> \
        <p>Twoja przeglądarka nie obsługuje canvas.</p> \
        </canvas>';

        document.getElementById('scaling_area').innerHTML = canvas_init_text;
        board.canvas_id = document.getElementById('game_canvas');

        board.c = board.canvas_id.getContext('2d');

    },

    /**
     * meotoda rysuje martwe komórki -- zapełnianie planszy podczas inicjalizacji lub resetu;
     * pobiera aktualne wymiary planszy i przelicza preskaler do skalowania;
     * generuje tablice pozycji komorek na planszy
     */
    init_draw_cells: function(){

        var horizontal = $("#horizontal_amount").val();
        var vertical = $("#vertical_amount").val();

        var hmax = parseInt($("#horizontal_amount").prop('max'));
        var hmin = parseInt($("#horizontal_amount").prop('min'));
        var vmax = parseInt($("#vertical_amount").prop('max'));
        var vmin = parseInt($("#vertical_amount").prop('min'));

        if(horizontal.match(/^[0-9]+$/) === null){
            game.status_bar('red', 'Wprowadzona wartość ilości komórek (poziomo) nie jest liczba.');
            game.button_unable('set', false);
            return;
        }
        else if(vertical.match(/^[0-9]+$/) === null){
            game.status_bar('red', 'Wprowadzona wartość ilości komórek (pionowo) nie jest liczba.');
            game.button_unable('set', false);
            return;
        }

        horizontal = parseInt(horizontal);
        vertical = parseInt(vertical);

        if(horizontal > hmax || horizontal < hmin){
            game.status_bar('red', 'Wymiar poziomy planszy jest spoza dozwolonego zakresu ('+hmin+', '+hmax+').');
            $("#horizontal_amount").val(hmin).change();
            return;
        }
        else if(vertical > vmax || vertical < vmin){
            game.status_bar('red', 'Wymiar pionowy planszy jest spoza dozwolonego zakresu ('+vmin+', '+vmax+').');
            $("#vertical_amount").val(vmin).change();
            return;
        }

            game.button_unable('set', true);

            board.canvas_w = 2 * (board.cell_radius + board.cell_padding) * horizontal;
            board.canvas_h = 2 * (board.cell_radius + board.cell_padding) * vertical;

            this.is_clear = true;
            board.set_canvas_dimension();

            board.clear();

            var ref = $("#game_canvas")[0];
            ref.width = board.canvas_w;
            ref.height = board.canvas_h;

            var min_pos_x = board.cell_padding + board.cell_radius;
            var max_pos_x = board.canvas_w - (board.cell_padding + board.cell_radius);
            var min_pos_y = board.cell_padding + board.cell_radius;
            var max_pos_y = board.canvas_h - (board.cell_padding + board.cell_radius);
            var distance = (board.cell_radius + board.cell_padding) * 2;

            board.pos_tab = [];

            for (var x = min_pos_x; x <= max_pos_x; x += distance) {
                var pos_row = [];
                for (var y = min_pos_y; y <= max_pos_y; y += distance) {
                    pos_row.push({'x': x, 'y': y, 'state': 'dead'});
                }

                board.pos_tab.push(pos_row);
            }
            board.size_i = board.pos_tab.length;
            board.size_j = board.pos_tab[0].length;


            for (var i = 0; i < board.pos_tab.length; i++)
                for (var j = 0; j < board.pos_tab[i].length; j++) {

                    var x = board.pos_tab[i][j].x;
                    var y = board.pos_tab[i][j].y;
                    var state = board.pos_tab[i][j]['state'];
                    board.set_field(i, j, state);
                }


    },

    /**
     * metoda czysci plansze
     */
    clear: function(){
        board.c.clearRect(0,0,board.canvas_w, board.canvas_h);
    },

    /**
     * metoda oblicza preskaler
     */
    set_canvas_dimension: function(){
        board.prescaler = board.canvas_w/$("canvas").width();
    },

    /**
     * kolejne dwie funkcje sa wykorzystywane do rysowania poprzedniej/nastepnej planszy w trybie zabawy
     */
    prev_board: function(){
        this.set_generated(info.current_step-1);
    },

    next_board: function(){
        this.set_generated(info.current_step+1);
    },

    /**
     * funkcja nanosi dowolna plansze z historii (tryb zabawy)
     * @param no -- numer planszy do narysowania
     */
    set_generated: function(no){
        board.cells = [];
        info.current_step = no;
        for (var i = 0; i < board.size_i; i++) {
            var row = [];
            for (var j = 0; j < board.size_j; j++)
                if(fun_storage.history[no][i][j] === true) {
                    row.push(new Cell(true, i, j));
                    this.set_field(i, j, 'live');
                }
                else if(fun_storage.history[no][i][j] === false) {
                    row.push(new Cell(false, i, j));
                    this.set_field(i, j, 'dead');
                }
            board.cells.push(row);
        }
        $("#game_age").text(no);
    },

    /**
     * funkcja generuje tablice stanow komorek (true/false) i ja zwraca
     * @returns {Array}
     */
    get_board: function(){
        var cell_memento = [];
        for (var i = 0; i < board.size_i; i++) {
            var memento_row = [];
            for (var j = 0; j < board.size_j; j++) {
                memento_row.push(board.cells[i][j].is_alive);
            }
            cell_memento.push(memento_row);
        }
        return cell_memento;
    },

    /**
     * funkcja nanosi podana plansze
     * @param board_to_set -- plansza do naniesienia
     * @returns {boolean} -- powodzenie wykonania
     */
    set_board: function(board_to_set){
        if(!board_to_set) return false;

        board.cells = [];
        for (var i = 0; i < board.size_i; i++) {
            var row = [];
            for (var j = 0; j < board.size_j; j++)
                if(board_to_set[i][j] === true) {
                    row.push(new Cell(true, i, j));
                    this.set_field(i, j, 'live');
                }
                else if(board_to_set[i][j] === false) {
                    row.push(new Cell(false, i, j));
                    this.set_field(i, j, 'dead');
                }
            board.cells.push(row);
        }
        $("#game_age").text('0');
        return true;
    },

    /**
     * funkcja zlicza i zapamietuje liczbe komorek zywych
     * @param board -- plansza w ktorej zliczane sa komorki
     */
    count_alives: function(board){
        var lived_amount = 0;
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board[i].length; j++) {
                if(board[i][j])
                    lived_amount++;
            }
        }
        info.alives_amount = lived_amount;
    },

    /**
     * funkcja zlicza i zwraca liczbe komorek zywych
     * @param board -- plansza w ktorej zliczane sa komorki
     * @returns {number} -- ilosc zywych komorek
     */
    get_alives_amount: function(board){
        var lived_amount = 0;
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board[i].length; j++) {
                if(board[i][j])
                    lived_amount++;
            }
        }
        return lived_amount;
    }
};

