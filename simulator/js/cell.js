/**
 * funkcja obslugujaca przechowywanie wlasnosci komorek
 * @param state -- zywa lub martwa
 * @param i
 * @param j - id's komorek
 * @constructor
 */
function Cell(state, i, j) {
    this.age = 0;
    this.is_alive = state;
    this.i = i;
    this.j = j;
}

/**
 * funkcja wspierajca sprawdzanie zmiany stanu komorek
 * @returns {*} -- stan komorki jaki powinien sie ustawic w nastepnym kroku ewolucji ukladu
 */
Cell.prototype.condition = function() {

    var neighboars_amount = board.numberOfNeightbour( this.i, this.j);
    /*var max_die = 3;
    var min_die = 2;
    var max_not_changed = 2;
    var min_not_changed = 2;*/
    //wyzej nie wykorzystane zmienne do zasad gry innych niz zasady canway'a

    //warunki na zasady canway'a
    if (!this.is_alive && neighboars_amount == 3)
        return true;
    else if (this.is_alive && neighboars_amount != 2 && neighboars_amount != 3)
        return false;
    else
        return this.is_alive;
};

