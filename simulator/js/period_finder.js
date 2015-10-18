/**
 * obiekt poszukajacy okresowosci ukladu
 * @param beginning_id -- plansza od ktorej zaczynaja sie poszukiwania
 * @param ending_id -- -- plansza od ktorej koncza sie poszukiwania
 * @constructor
 */
function PeriodFinder(beginning_id, ending_id) {
    this.first = beginning_id;
    this.last = ending_id;
}

/**
 * metoda sprawdzajaca okresowosc lub jej brak
 * zwraca odpowiedni status
 * @param current_id -- biezaca plansza (jej numer)
 */
PeriodFinder.prototype.condition = function(current_id) {
    var bottom_pointer = (current_id - this.last) + this.first;
    var is_identical = true;

    for (var i = 0; i < board.size_i; i++) {
        for (var j = 0; j < board.size_j; j++) {
            if (sim_storage.current_simulation.boards[current_id][i][j] != sim_storage.current_simulation.boards[current_id][i][j]) {
                is_identical = false;
                break;
            }
        }
        if (!is_identical) break;}

    if(!is_identical) return false;
    else {
        if (bottom_pointer < this.last - 1) return undefined;
        else return true;
    }
};

