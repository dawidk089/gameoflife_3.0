/**
 * obiekt odpowiedzialny za logike gry w zycie
 */
game = {

    //OBJECT FIELDS
    interval_id: undefined,
    time_step: null,
    is_running: false,
    mode: null, //tryb/status gry
    periods_finders: [], //'poszukiwacze okresow' -- zapetlenia ewolucji; okresowosci ukladu
    current_step: undefined,
    is_restore: false,

    //OBJECT METHODS

    /**
     * obsluga przycisku start -- wlacza/wylacza ewolucje planszy
     * @param event
     *//*
    start: function(event){
        if(!game.is_running) {
            board.init_cells();
            if(game.mode == 'zabawa') {
                game.switch_control_panel(null, 'started/fun');
                game.interval_id = window.setInterval(game.switch_to_last, game.time_step);
            }
            else if(game.mode == 'symulacje') {
                game.switch_control_panel(null, 'started/simulation');
                game.interval_id = window.setInterval(game.next_step_op, game.time_step);
            }
            game.is_running = true;
        }
        else{
            window.clearInterval(game.interval_id);
            board.canvas_id.addEventListener('click', board.set_cell_event );
            if(game.mode == 'zabawa')
                game.switch_control_panel(null, 'stopped/fun');
            else if(game.mode == 'symulacje') {
                game.switch_control_panel(null, 'stopped/simulation');
            }
            game.is_running = false;
            game.interval_id = undefined;
        }
    },*/

    /**
     * wykonuje jeden krok ewolucji
     */
    next_step_op: function() {
        if(board.cells === undefined)
            throw Error("boards.cells doesnt exist -> you should init them!");
        else if( info.board_state.create && info.board_state.storage && info.board_state.check) {
            ++info.current_step;
            info.board_state.create = false;
            info.board_state.storage = false;
            info.board_state.check = false;
        }

        if(!info.board_state.create || game.mode == 'zabawa') {
            // kopiowanie
            var cell_copy = [];

            for (var i = 0; i < board.size_i; i++) {
                var row = [];
                for (var j = 0; j < board.size_j; j++) {
                    row.push(new Cell(board.cells[i][j].is_alive, i, j));
                }
                cell_copy.push(row);
            }

            //przeliczanie na kopii
            for (var i = 0; i < board.size_i; i++)
                for (var j = 0; j < board.size_j; j++) {
                    cell_copy[i][j].is_alive = board.cells[i][j].condition();
                }

            //przenoszenie nowo wygenerowanej planszy
            board.cells = cell_copy;
            info.board_state.create = true;
            board.set_cells();
        }

        //dodawanie do storage
        if (!info.board_state.storage || game.mode == 'zabawa') {
            // kopiowanie
            var new_board = [];
            for (var i = 0; i < board.size_i; i++) {
                var new_board_row = [];
                for (var j = 0; j < board.size_j; j++)
                    new_board_row.push(board.cells[i][j].is_alive);
                new_board.push(new_board_row);
            }

            if (game.mode == 'symulacje') {
                //+spr warunku koncowego
                sim_storage.current_simulation.add_board(new_board);
            }
            else if (game.mode == 'zabawa') {
                fun_storage.history.push(new_board);
                ++info.current_step;
                info.board_state.storage = true;
            }
        }

        //reakcja na stan symulacji
        if(game.mode == 'symulacje'){
            if(info.simulation_state !== undefined && info.simulation_state !== 'evoluating...') {
                $("aside #simulation_control input[name='start']").click();
                game.switch_control_panel(null, "done/simulation");
                info.set_diode();
            }
            else
                info.simulation_state = 'evoluating...';
        }
        info.set_game();
    },

    /**
     * metoda wspierajaca zmiane czasu interwalu poprzez formularz;
     * gdy interwal jest wlaczony -- wylacza go i wlacza nowy z innym czasem
     */
    set_time_step: function(){
        game.time_step = 1000.0/parseFloat($("aside input[name='frequency']").val());
        if(game.interval_id != undefined){
            window.clearInterval(game.interval_id);
            game.interval_id = window.setInterval(game.next_step_op, game.time_step);
        }
    },

    /**
     * wlacza/wylacza mozliwosc zmiany stanu komorki poprzez klikanie w nie
     * @param is_unable -- true/false
     */
    cell_unable: function(is_unable){
        if(is_unable || is_unable === undefined)
            board.canvas_id.addEventListener('click', board.set_cell_event);
        else
            board.canvas_id.removeEventListener('click', board.set_cell_event);
    },

    /**
     * funkcja wspierajaca uaktywnienie/dezaktywacje przyciskow
     * @param name -- nazwa przycisku (input)
     * @param is_unable -- true/false
     */
    button_unable: function(name, is_unable){
        if(is_unable === undefined) {
            var button_set = false;
        }
        else {
            var button_set = !is_unable;
        }
        $("aside input[name='"+name+"']").prop('disabled', button_set);
    },

    /**
     * metoda odpowiedzialna przelaczanie formularza wg scenariusza gry
     * @param mode_param -- tryb gry
     */
    switch_control_panel: function(event, mode_param){
        var mode = mode_param;
        if( mode == undefined )
            mode = $(this).data("mode");

        switch(mode){
            case "init/fun":
                $('.input_wrapping').hide();
                $('#state').hide();
                $("#dimension_setting").show();

                break;
            case "stopped/fun":
                $('#state').show();
                $("aside input[name='start']").attr('value', 'start');
                game.cell_unable();
                $("aside input[name='frequency']").show();
                $("aside #mode select").prop('disabled', false);


                game.button_unable('start');
                game.button_unable('mode');
                game.button_unable('prev_step');
                game.button_unable('next_step');
                game.button_unable('last');
                game.button_unable('reset');

                break;
            case "started/fun":
                $('#state').show();
                game.cell_unable(false);
                $("aside input[name='start']").attr('value', 'stop');
                $("aside input[name='frequency']").show();
                $("aside #mode select").prop('disabled', true);


                game.button_unable('start');
                game.button_unable('mode', false);
                game.button_unable('prev_step', false);
                game.button_unable('next_step', false);
                game.button_unable('last', false);
                game.button_unable('reset', false);
                break;
            case "stopped/simulation":
                $('#state').show();
                game.cell_unable(false);
                $("aside input[name='start']").attr('value', 'start');
                $("aside input[name='frequency']").hide();
                $("aside #mode select").prop('disabled', false);

                $("#simulation_control input, #sim_save_state").show();
                $("aside input[name='init']").hide();
                $("aside input[name='cancel']").hide();

                game.button_unable('start');
                game.button_unable('new_sim');
                game.button_unable('prev_sim');
                game.button_unable('next_sim');
                game.button_unable('save');
                game.button_unable('restore');
                game.button_unable('delete');

                break;
            case "started/simulation":
                $('#state').show();
                game.cell_unable(false);
                $("aside input[name='start']").attr('value', 'stop');
                $("aside input[name='frequency']").hide();
                $("aside #mode select").prop('disabled', true);

                $("#simulation_control input, #sim_save_state").show();
                $("aside input[name='init']").hide();
                $("aside input[name='cancel']").hide();

                game.button_unable('start', true);
                game.button_unable('new_sim', false);
                game.button_unable('prev_sim', false);
                game.button_unable('next_sim', false);
                game.button_unable('save', false);
                game.button_unable('restore', false);
                game.button_unable('delete', false);

                break;
            case "init/simulation":
                $('#state').hide();
                game.cell_unable();
                $("aside input[name='frequency']").hide();

                $("#simulation_control input, #sim_save_state").hide();
                $("aside input[name='init']").show();
                $("aside input[name='cancel']").show();

                if(sim_storage.simulations.length === 0)
                    game.button_unable('cancel', false);
                else
                    game.button_unable('cancel');

                break;

            case "done/simulation":
                $('#state').show();
                game.cell_unable(false);

                $("aside input[name='frequency']").hide();
                $("#simulation_control input, #sim_save_state").show();
                $("aside input[name='init']").hide();
                $("aside input[name='cancel']").hide();

                game.button_unable('start', false);
                break;

            default:
                throw Error("Źle wybrany stan gry.");
        }
    },

    /**
     * funkcja wspierajaca zmiane gry miedzy trybem zabawy i symulacji
     */
    change_mode: function(){
        var mode_game = $("aside select[name='mode']").find("option:selected").text();

        if(mode_game == 'symulacje') {
            game.switch_control_panel(null, 'init/simulation');
            game.mode = 'symulacje';
            $('.input_wrapping').hide();
            $('.input_wrapping').eq(1).show();
            $('.input_wrapping').eq(3).show();
            fun.reset();
            if(game.is_restore) {
                info.restore();
                info.set_game();
                info.set_simulation();
                board.set_cells();
                if(info.simulation_state !== undefined && info.simulation_state !== 'evoluating...')
                    game.switch_control_panel(null, 'done/simulation');
                else
                    game.switch_control_panel(null, "stopped/simulation");
                if(!board.set_board(sim_storage.current_simulation.boards[info.current_step-1]))
                    throw Error('niepowodzenie ustawienia planszy');
            }

        }
        else if(mode_game == 'zabawa'){
            game.mode = 'zabawa';
            $('.input_wrapping').hide();
            $('.input_wrapping').eq(1).show();
            $('.input_wrapping').eq(2).show();
            game.switch_control_panel(null, 'stopped/fun');
            info.reset_game();
        }


    },

    /**
     * metoda obslugujaca przycisk reset gry
     *//*
    reset: function(){
        $("#game_age").text('0');
        if(game.mode === 'zabawa')
            fun.reset();
        else if(game.mode === 'symulacje')
            sim.reset();

    },*/

    /**
     * funkcja pobierajaca dane z biezacej symulacji (ze storage) do obiektow zarzadzajac gra
     * ustawia plansze
     */
    init_from_storage: function(){
        if(!board.set_board(sim_storage.current_simulation.boards[sim_storage.current_simulation.step_amount - 1]))
            throw Error('niepowodzenie ustawienia planszy');
        info.set_game();
    },

    /**
     * funkcja wspiera obsluge paska statusu
     * @param color -- kolor wiadomosci
     * @param messeage -- tekst wiadomosci
     */
    status_bar: function(color, messeage){
        $("#status").html(messeage).css({ "color": color});
    },

    /**
     * pobieranie planszy do storage po inicjalizacji/przed pierwszy krokiem ewolucji
     */
    get_first_board: function(){
        board.init_cells();
        sim_storage.current_simulation.add_board(board.get_board());
        info.board_state.create = true;
        info.simulation_state = 'evoluating...';
        info.current_step = 1;
        info.simulation_state.create = true;
    }
};

/**
 * obiekt wspierajacy sterowaniem gry w trybie zabawy
 */
fun = {

    /**
     * obsluga przycisku start -- wlacza/wylacza ewolucje planszy
     * @param event
     */
    start: function(event){
        if(!game.is_running) {
            board.init_cells();
            game.switch_control_panel(null, 'started/fun');
            game.interval_id = window.setInterval(fun.switch_to_last, game.time_step);
            game.is_running = true;
        }
        else{
            window.clearInterval(game.interval_id);
            board.canvas_id.addEventListener('click', board.set_cell_event );
            game.switch_control_panel(null, 'stopped/fun');
            game.is_running = false;
            game.interval_id = undefined;
        }
    },

    /**
     * funkcja interwalu przechodzacego do konca wszystkich juz wygenerowanych plansz
     */
    switch_to_last: function(){
        if(info.current_step >= fun_storage.history.length-1) {
            window.clearInterval(game.interval_id);
            game.interval_id = window.setInterval(game.next_step_op, game.time_step);
        }
        else
            board.next_board(fun_storage.history);
    },

    /**
     * przesuwanie planszy w trybie zabawy
     */
    prev_one_step: function(){
        if(info.current_step !== undefined && info.current_step-1>=0)
            board.prev_board();
    },

    next_one_step: function(){
        if(info.current_step === undefined)
            fun_storage.history = [];
            board.init_cells();
        if(info.current_step >= fun_storage.history.length-1)
            fun.generate_next_board();
        else {
            board.next_board();
        }
    },

    /**
     * generuje nastepna plansze uzywajac zasad conway'a
     */
    generate_next_board: function(){
        board.status = 'run';
        board.init_cells();
        game.next_step_op(fun_storage.history);
    },

    /**
     * obsluga przycisku ustawiajaca na ostatnia wygenerowana plansze
     */
    set_last: function(){
        if(info.current_step !== undefined)
            board.set_generated(fun_storage.history.length-1)
    },

    /**
     * obsluga przycisku resetujacego gre
     */
    reset: function(){
        info.current_step = undefined;
        fun_storage.history = [];
    }
};

sim = {
    /**
     * obsluga przycisku start -- wlacza/wylacza ewolucje planszy
     * @param event
     */
    start: function(event){
        if(!game.is_running) {
            board.init_cells();
            game.switch_control_panel(null, 'started/simulation');
            game.interval_id = window.setInterval(game.next_step_op, game.time_step);
            game.is_running = true;
        }
        else{
            window.clearInterval(game.interval_id);
            board.canvas_id.addEventListener('click', board.set_cell_event );
            game.switch_control_panel(null, 'stopped/simulation');
            game.is_running = false;
            game.interval_id = undefined;
        }
    },

    /**
     * funkcja inicjalizujaca nowa symulacje
     * inicjalizuje dane w storage
     */
    init: function(){
        if(board.init_cells()){
            game.is_restore = true;
            info.current_step = 0;
            sim_storage.new_simulation();
            info.set_simulation();
            game.get_first_board();
            board.count_alives(sim_storage.current_simulation.boards[0]);
            info.set_game();
            sim_storage.current_simulation.set_state();
            game.switch_control_panel(null, 'stopped/simulation');
        }
        else {
            board.cells = [];
            game.status_bar("orange", "Nie zaznaczono żadnej komórki.");
        }
    },

    /**
     * funkcja usuwa symulacje
     * aktualizuje dane w storage
     */
    del: function(){
        game.periods_finders = [];
        sim_storage.del();
        if(sim_storage.simulations.length === 0) {
            game.is_restore = false;
            info.clear();
            game.switch_control_panel(null, "init/simulation");
            info.reset_game();
            board.init_draw_cells();
        }
        else{
            sim_storage.switch_sim();
            if(!board.set_board(sim_storage.current_simulation.boards[sim_storage.current_simulation.step_amount-1]))
                throw Error('niepowodzenie ustawienia planszy');
            //#
        }
        info.set_simulation();
        info.set_game();
       },

    /**
     * funkcja przywraca symulacje do stanu podczas inicjalizacji
     */
    restore: function(){
        game.periods_finders = [];
        if(!board.set_board(sim_storage.current_simulation.boards[0]))
            throw Error('niepowodzenie ustawienia planszy');
        sim_storage.del();
        game.switch_control_panel(null, "init/simulation");
        info.reset_game();
        info.clear();
    },

    /**
     * funkcja przechodzi adaptuje tryb inicjalizacji nowej symulacji
     */
    new_sim: function(){
        if(!info.board_state.create) {
            game.get_first_board();
            info.board_state.create = true;
        }
        if(!info.board_state.storage) {
            sim_storage.current_simulation.add_board(board.get_board());
            ++info.current_step;
        }
        sim_storage.current_simulation.set_state();
        info.clear();
        sim_storage.current_simulation = undefined;
        game.periods_finders = [];
        game.switch_control_panel(null, "init/simulation");
        info.reset_game();
        board.init_draw_cells();
    },

    /**
     * przelaczanie miedzy symulacjami
     * zapisywanie/pobieranie danych (storage)
     * ustawianie planszy
     */
    prev_sim: function(){
        if(info.current_sim_id > 0) {
            if(sim_storage.current_simulation.boards === undefined)
                game.get_first_board();
            if(!info.board_state.storage) {
                sim_storage.current_simulation.add_board(board.get_board());
                ++info.current_step;
            }
            sim_storage.current_simulation.set_state();
            sim_storage.switch_sim('prev');
            if(!board.set_board(sim_storage.current_simulation.boards[sim_storage.current_simulation.step_amount-1]))
                throw Error('niepowodzenie ustawienia planszy');
            game.init_from_storage();
            info.set_simulation();
        }
    },

    next_sim: function(){
        if(info.current_sim_id < sim_storage.simulations.length-1) {
            if(sim_storage.current_simulation.boards === undefined)
                game.get_first_board();
            if(!info.board_state.storage) {
                sim_storage.current_simulation.add_board(board.get_board());
                ++info.current_step;
            }
            sim_storage.current_simulation.set_state();
            sim_storage.switch_sim('next');
            if(!board.set_board(sim_storage.current_simulation.boards[sim_storage.current_simulation.step_amount-1]))
                throw Error('niepowodzenie ustawienia planszy');
            game.init_from_storage();
            info.set_simulation();
        }
    },

    /**
     * funkcja sprawdza i zabezpiecza skonczona symulacje przed wlaczeniem
     */
    check_done: function(){
        if(info.simulation_state !== undefined && info.simulation_state !== 'evoluating...') {
            game.switch_control_panel(null, "done/simulation")
        }
        else
            game.switch_control_panel(null, "stopped/simulation");
    },

    /**
     * funkcja obsluguje anulowanie inicjalizacji nowej symulacji
     */
    cancel: function(){
        sim_storage.switch_sim('last');
        if(!board.set_board(sim_storage.current_simulation.boards[sim_storage.current_simulation.step_amount-1]))
            throw Error('niepowodzenie ustawienia planszy');
        game.init_from_storage();
        info.set_simulation();
    },

    /**
     * funkcja wspiera wysylanie symulacji na serwer
     * obsluguje interwaly, podejmujace probe wysylania
     */
    save: function(){
        if(sim_storage.current_simulation.boards === undefined)
            game.get_first_board();
        if(!info.board_state.storage)
            sim_storage.current_simulation.add_board(board.get_board());
        sim_storage.current_simulation.set_state();
        sim_storage.current_simulation.save_status = 'waiting';
        info.set_diode();
        if(!sim_storage.id_send_interval){
            //console.log(JSON.stringify(sim_storage));
            sim_storage.id_send_interval = window.setInterval(sim_storage.send_to_server, 2000);
        }
    }
};

/**
 * obiekt odpowiedzialny za przechowywanie aktualnego stanu gry
 */
info = {
    current_step: undefined,
    alives_amount: undefined,
    board_state: {
        create: undefined,
        storage: undefined,
        check: undefined
    },
    current_sim_id: undefined,
    simulation_state: undefined,

    /**
     * pobiera stan gry ze storage
     */
    get_from_storage: function(){
        this.current_step = sim_storage.current_simulation.step_amount;
        this.alives_amount = sim_storage.current_simulation.alives;
        this.simulation_state = sim_storage.current_simulation.state;

        this.board_state.check = sim_storage.current_simulation.last_board_state.check;
        this.board_state.create = sim_storage.current_simulation.last_board_state.create;
        this.board_state.storage = sim_storage.current_simulation.last_board_state.storage;

        game.periods_finders = sim_storage.current_simulation.periods_finders;
    },

    /**
     * ustawia numer symulacji w panel kontrolnym
     */
    set_simulation: function(){
        if(info.current_sim_id === undefined)
            $("#sim_no").text('init');
        else
            $("#sim_no").text(this.current_sim_id + 1);
        this.set_diode();
        $("#sim_count").text(sim_storage.simulations.length);
    },

    /**
     * ustawia diode w panelu kontrolnym w zaleznosci od stanu
     */
    set_diode: function(){
        if(this.current_sim_id !== undefined)
            switch(sim_storage.current_simulation.save_status) {
                case 'waiting':
                    sim_storage.color_diode('red');
                    break;
                case 'processing':
                    sim_storage.color_diode('orange');
                    break;
                case 'saved':
                    sim_storage.color_diode('green');
                    break;
                case 'unsaved':
                    switch (info.simulation_state) {
                        case undefined:
                        case 'evoluating...':
                            sim_storage.color_diode('dodgerblue');
                            break;
                        case 'periodic':
                        case 'died':
                        case 'const':
                            sim_storage.color_diode('darkblue');
                            break;
                    }
                    break;
                case 'error':
                    sim_storage.color_diode('gray');
                    break;
                default:
                    throw Error('info.set_diode: zaden przypadek nie zostal przechwycony: ', sim_storage.current_simulation.save_status);
                    break;
            }
    },

    /**
     * ustawia informacje o stanie gry w panelu kontrolnym
     */
    set_game: function(){
        $("#game_age").text(this.current_step);
        $("#game_state").text(this.simulation_state);
        $("#lived_amount").text(this.alives_amount);
    },

    /**
     * resetuje informacje o stanie gry w panelu kontrolnym
     */
    reset_game: function(){
        $("#game_age").text('n/a');
        $("#game_state").text('n/a');
        $("#lived_amount").text("n/a");
    },

    /**
     * czysci przechowywane informacje o stanie gry
     */
    clear: function(){
        this.current_step = undefined;
        this.alives_amount = undefined;
        this.simulation_state = undefined;
        this.current_sim_id = undefined;

        this.board_state.check = undefined;
        this.board_state.create = undefined;
        this.board_state.storage = undefined;
    },

    /**
     * przywraca z local storage informacje o stanie gry
     */
    restore: function(){
        var info_sets = JSON.parse(localStorage['info']);

        info.current_step = info_sets.current_step;
        info.alives_amount = info_sets.alives_amount;
        info.board_state = info_sets.board_state;
        info.current_sim_id = info_sets.current_sim_id;
        info.simulation_state = info_sets.simulation_state;
    }
};

