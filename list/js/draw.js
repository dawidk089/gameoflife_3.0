/**
 * obiekt prototypowany -- pojedyncza plansza gry w zycie
 * @param horizontal -- ilosc komorek poziomo
 * @param vertical -- ilosc komorek w pionie
 * @param padding -- dodawana wartosc do promienia komorki wplywajaca na odleglosc miedzy nimi
 * @param radius -- promien komorki
 * @constructor
 */
function Board(horizontal, vertical, padding, radius){
    this.horizontal = horizontal;
    this.vertical = vertical;
    this.cell_padding = padding;
    this.cell_radius = radius;
    this.width = 2*(this.cell_radius+this.cell_padding)*this.horizontal;
    this.height = 2*(this.cell_radius+this.cell_padding)*this.vertical;
    this.context = null;

    this.canvas_id = null;
}

/**
 * metoda inicjalizujaca plansze;
 * wstawia tag canvas do html, pobiera kontekst canvas, czysci plachte
 * @param canvas_id -- nazwa id po ktorym mozna sie odwolac do canvas tego obiektu
 * @param scaling_id -- nazwa id po ktorym mozna sie odwolac do div'a w ktorym znajduje sie canvas tego obiektu;
 *                      div sluzy do dynamicznego skalowania plachty
 */
Board.prototype.init_canvas = function(canvas_id, scaling_id) {

    var canvas_init_text = '<canvas id="' + canvas_id + '" width="' + this.width + '" height="' + this.height +'" class="game_canvas"><p>Twoja przeglądarka nie obsługuje canvas.</p></canvas>';

    document.getElementById(scaling_id).innerHTML = canvas_init_text;
    this.canvas_id = document.getElementById(canvas_id);
    this.context = this.canvas_id.getContext('2d');

    this.context.clearRect(0, 0, this.width, this.height);
};

/**
 * metoda wspomagajaca narysowanie komorki --  uzywana jest bezposrednio w szablonach phtml wspolpracujac
    ze wstawkami php
 * @param x -- wps. x plachty
 * @param y -- wps. y plachty
 * @param live -- stan komorki
 */
Board.prototype.draw_cell = function(x,y, live){
    this.context.strokeStyle = 'black';

    if(!live)
        this.context.fillStyle = '#222';
    else
        this.context.fillStyle = '#f60';
    this.context.beginPath();
    this.context.arc(x, y, this.cell_radius, 0, Math.PI * 2, false);
    this.context.closePath();
    this.context.stroke();
    this.context.fill();
};


/**
 * metoda umozliwia narysowanie planszy
 *//*

Board.prototype.draw = function(){
    for(var i=0; i<this.horizontal;++i)
        for(var j=0; j<this.vertical;++j) {
            this.draw_cell(
                (i*2+1)*(this.cell_radius+this.cell_padding),
                (j*2+1)*(this.cell_radius+this.cell_padding)
            );
        }
};*/
