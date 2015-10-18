/**
 * obiekt wspierajacy archiwizowanie przeprowdzonej symulacji
 * przechowuje minimum informacji by szybko odtworzyc symulacje lub utowrzyc statystyke
 */
fun_storage = {
    history: [] //tablica plansz ze zmienna typu boolean odpowiadajaca stanom komorki (true-zywa, false-martwa)
};

/**
 * storage odpowiedzialny za symulacje
 */
sim_storage = {

    /**
     * zapis i przywracanie danych z local storage z wykorzystaniem kodowania danych JSON'em
     * ..oraz dekodowania i odtwarzania obiektow
     */
    update_localStorage: function(){
        localStorage['simulations'] = JSON.stringify(sim_storage.simulations);
        localStorage['current_simulation'] = JSON.stringify(sim_storage.current_simulation);
        localStorage['cells'] = JSON.stringify(board.cells);
        localStorage['info'] = JSON.stringify(info);
        localStorage['is_restore'] = JSON.stringify(game.is_restore);
        localStorage['period_finders'] = JSON.stringify(game.periods_finders);
    },

    restore_from_localStorage: function(){

        if(localStorage['is_restore'])
            game.is_restore = JSON.parse(localStorage['is_restore']);
        else
            game.is_restore = false;

        if(game.is_restore){
            //tablica symulacji
            var simulations_sets = JSON.parse(localStorage['simulations']);
            for(i=0; i<simulations_sets.length; ++i){
                var simulation = new Simulation();
                
                simulation.boards = simulations_sets[i].boards;
                simulation.state = simulations_sets[i].state;
                if(simulations_sets[i].last_board_state) {
                    simulation.last_board_state = {
                        check: simulations_sets[i].last_board_state.check,
                        create: simulations_sets[i].last_board_state.create,
                        storage: simulations_sets[i].last_board_state.storage
                    };
                }
                else{
                    simulation.last_board_state = {
                        check: undefined,
                        storage: undefined,
                        create: undefined
                    };
                }

                simulation.step_amount = simulations_sets[i].step_amount;
                simulation.alives = simulations_sets[i].alives;
                simulation.save_status = simulations_sets[i].save_status;

                sim_storage.simulations.push(simulation);
            }
            
            //current_simulation
            var info_sets = JSON.parse(localStorage['info']);
            sim_storage.current_simulation = sim_storage.simulations[info_sets.current_sim_id];

            //cells
            board.cells = JSON.parse(localStorage['cells']);

            //period finders
            game.periods_finders = JSON.parse(localStorage['period_finders']);

            info.restore();
            sim_storage.current_simulation.set_state();
            info.clear();
        }
        else
            console.warn("empty or broken localStorage");
    },

    /**
     * metoda wysylajaca symulacje na serwer
     * gdy plansza nie jest zainicjowana (bez pierwszego uruchomienia) -- inicjuje ja
     * obsluguje informacje zwrotna o stanie wysylania
     */
    send_to_server: function() {

        var is_sended = false;

        for(i=0; i<sim_storage.simulations.length; ++i) {
            
            
            var simulation = sim_storage.simulations[i];
            if (simulation.save_status === 'waiting' || simulation.save_status === 'error') {

                is_sended = true;
                simulation.save_status = 'processing';
                info.set_diode();
                   
                console.log('appl_path: '+appl_path);
                console.log('simulation before: ', simulation);
                
                
                $.ajax(appl_path + "Main/add_simulation", {
                    type: "POST",
                    data: JSON.stringify({
                        'simulation': simulation,
                        'id': i
                    }),
                    statusCode: {
                        404: function () {
                            simulation.save_status = 'waiting';
                            info.set_diode();
                            sim_storage.update_localStorage();
                        },
                        500: function () {
                            simulation.save_status = 'error';
                            info.set_diode();
                            sim_storage.update_localStorage();
                        },
                        0: function () {
                            simulation.save_status = 'waiting';
                            info.set_diode();
                            sim_storage.update_localStorage();

                        }
                    }
                }).done(function (data, status) {
                    /*
                    odbiera dokonczona symulacje
                     */
						
                    if (status === 'success') {
                        console.log('data from server (simulation): ', data);
                    	var data_dec = JSON.parse(data);
                        if (data_dec['save_status'] === 'saved') {
                            var is_current = (sim_storage.simulations[data_dec['id']] === sim_storage.current_simulation);

                            sim_storage.simulations[data_dec['id']].save_status = 'saved';
                            sim_storage.simulations[data_dec['id']].boards = data_dec['boards'];
                            sim_storage.simulations[data_dec['id']].state = data_dec['simulation_status'];
                            sim_storage.simulations[data_dec['id']].last_board_state = {
                                create: true,
                                storage: true,
                                check: true
                            };
                            sim_storage.simulations[data_dec['id']].step_amount = sim_storage.simulations[data_dec['id']].boards.length;
                            sim_storage.simulations[data_dec['id']].alives = board.get_alives_amount(
                                sim_storage.simulations[data_dec['id']].boards[
                                    sim_storage.simulations[data_dec['id']].step_amount-1
                                    ]);
                            if(is_current) {
                                info.get_from_storage();
                                if(!board.set_board(sim_storage.current_simulation.boards[sim_storage.current_simulation.step_amount-1]))
                                    throw Error('niepowodzenie ustawienia planszy');
                                info.set_game();
                                game.switch_control_panel(null, "done/simulation");
                            }

                            info.set_diode();
                        }
                        else {
                            sim_storage.simulations[data_dec['id']].save_status = 'error';
                            info.set_diode();
                        }
                    }
                    sim_storage.update_localStorage();
                }).error(function(){
                    simulation.save_status = 'error';
                    info.set_diode();
                    sim_storage.update_localStorage();
                });
            }
        }

        if(!is_sended) {
            window.clearInterval(sim_storage.id_send_interval);
            sim_storage.id_send_interval = undefined;
        }
    },

    /**
     * wspiera rysowanie diody
     * @param color
     */
    color_diode: function(color){
        var c = document.getElementById('diode_canvas').getContext('2d');
        c.clearRect(0, 0, 50, 50);
        c.strokeStyle = 'black';
        c.fillStyle = color;
        c.beginPath();
        c.arc(25, 25, 10, 0, Math.PI * 2, false);
        c.closePath();
        c.stroke();
        c.fill();
    },

    /*
    przechowuje symulacje i referencje na biezaca symulacje
     */
    simulations: [],
    current_simulation: undefined,
    id_send_interval: undefined,

    /**
     * obsluguje dodawanie nowej symulacji, pobiera zainicjalizowana plansze
     */
    new_simulation: function(){
        this.simulations.push(new Simulation());
        info.current_sim_id = this.simulations.length-1;
        this.current_simulation = this.simulations[info.current_sim_id];

        info.board_state.check = false;
        info.board_state.create = false;
        info.board_state.storage = false;
    },

    /**
     * usuwa symulacje ze storage
     */
    del: function() {
        sim_storage.simulations.splice(info.current_sim_id, 1);
        sim_storage.current_simulation = undefined;
        if (sim_storage.simulations.length !== 0) {
            if (info.current_sim_id !== 0) //last
                info.current_sim_id -= 1;
        }
        board.cells = [];
    },

    /**
     * przelacza biezaca symulacje, ustawia odpowiednie wartosci
     * @param no
     */
    switch_sim: function(no){
        if(no === 'prev'){
            if(info.current_sim_id > 0) {
                info.current_sim_id -= 1;
                sim_storage.current_simulation = sim_storage.simulations[info.current_sim_id];
                info.get_from_storage();
                sim.check_done();
            }
        }
        else if(no === 'next'){
            if(info.current_sim_id < sim_storage.simulations.length-1) {
                info.current_sim_id += 1;
                sim_storage.current_simulation = sim_storage.simulations[info.current_sim_id];
                info.get_from_storage();
                sim.check_done();
            }
        }
        else if(no === 'last'){
            info.current_sim_id = sim_storage.simulations.length-1;
            sim_storage.current_simulation = sim_storage.simulations[info.current_sim_id];
            info.get_from_storage();
            sim.check_done();
        }
        else if(typeof(no) === 'number'){
            if(no >= 0 && no < sim_storage.simulations.length && sim_storage.simulations !== undefined) {
                info.current_sim_id = no;
                sim_storage.current_simulation = sim_storage.simulations[info.current_sim_id];
                info.get_from_storage();
                sim.check_done();
            }
        }
        else if(no === undefined){
            sim_storage.current_simulation = sim_storage.simulations[info.current_sim_id];
            info.get_from_storage();
            sim.check_done();
        }
    }
};

/**
 * obiekt prototypowany odpowiedzialny za trzymanie inforamcji o symulacjach znajdujacych sie w storage
 * @constructor
 */
function Simulation(){
    this.boards = undefined;
    this.state = undefined;
    this.last_board_state = {
        create: undefined,
        storage: undefined,
        check: undefined
    };
    this.step_amount = undefined;
    this.alives = undefined;
    this.save_status = 'unsaved';
    /*
    waiting
    processing
    saved
    unsaved
    error
     */
    this.periods_finders = undefined;
}

/**
 * metoda dodajaca plansze do symulacji
 * @param board
 */
Simulation.prototype.add_board = function(board) {
    if(this.boards === undefined) {
        this.boards = [];
        info.current_step = 0;
    }
    this.boards.push(board);
    info.board_state.storage = true;
    this.check_end();
};

/**
 * metoda sprawdzajaca koniec symulacji
 */
Simulation.prototype.check_end = function () {
    if(info.board_state.check)
        return;
    else
        info.board_state.check = true;

    var last_id = this.boards.length-1;

    // czy uklad wymarl
    board.count_alives(this.boards[last_id]);

    if(info.alives_amount == 0) {
        info.simulation_state = 'died';
        return;
    }

    if(last_id === 0) {
        info.simulation_state = 'evoluating...';
        return;
    }

    // czy period_finder'y cos znalazly
    for(var i = 0; i < game.periods_finders.length; i++){
        var state = game.periods_finders[i].condition(last_id);
        if(state == true) {
            info.simulation_state = 'periodic';
            return;
        }
        else if(state == false) game.periods_finders.splice(i, 1);
    }

    // czy jest staly
    var is_identical = true;
    for (var i = 0; i < board.size_i; i++) {
        for (var j = 0; j < board.size_j; j++) {
            if(this.boards[last_id][i][j] != this.boards[last_id-1][i][j]) {
                is_identical = false;
                break;
            }
        }
        if(!is_identical) break;
    }

    if(is_identical) {
        info.simulation_state = 'const';
        return;
    }

    // czy podejrzany o okresowosc
    for(var k = 0; k < last_id; k++) {
        is_identical = true;
        for (var i = 0; i < board.size_i; i++) {
            for (var j = 0; j < board.size_j; j++) {
                if (this.boards[last_id][i][j] != this.boards[k][i][j]) {
                    is_identical = false;
                    break;
                }
            }
            if (!is_identical) break;
        }
        if(is_identical){
            game.periods_finders.push(new PeriodFinder(k, last_id));
        }
    }
};

/**
 * przenoszenie informacje o biezacym stanie gry z obiektu info do storage
 */
Simulation.prototype.set_state = function(){
    this.state = info.simulation_state;
    this.step_amount = info.current_step;
    this.alives = info.alives_amount;

    this.last_board_state.create = info.board_state.create;
    this.last_board_state.storage = info.board_state.storage;
    this.last_board_state.check = info.board_state.check;

    this.periods_finders = game.periods_finders;
};

