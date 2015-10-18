<?php

// klasa wspierajaca poszukiwanie okresowosci wystepujacej w ewolucji
// przechowuje poczatkowy i koncowy nr planszy w przedziale, ktory jest podejrzany o okresowosc
class PeriodFinder{

    static public $period_finders = array();

    // metoda poszukuje powtarzajacych sie plansz
    // tworzy obiekt zwiazany z plansza, ktora powtorzyla sie w historii ewolucji
    static public function search($boards, $new_board, $x, $y, $size){
        for($k = 0; $k < $size-1; ++$k){
            if(PeriodFinder::is_identical($boards[$k], $new_board, $x, $y)){
                array_push(PeriodFinder::$period_finders, new PeriodFinder(
                    $k, count($boards)-1, $x, $y
                ));
            }
        }
    }

    // metoda weryfikuje przedzial podejrzewany o okresowosc (jeden krok)
    static public function check($boards){
        $iter = 0;
        foreach(PeriodFinder::$period_finders as $period_finder){
            if($period_finder->next_step($boards)) {
                return true;
            }
            else
            ++$iter;
        }
        return false;
    }

    // funkcja wspierajaca sprawdzanie identycznosci dwoch plansz
    static public function is_identical($board1, $board2, $x, $y){
        for($i = 0; $i < $x; ++$i)
            for($j = 0; $j < $y; ++$j)
                if($board1[$i][$j] !== $board2[$i][$j]) {
                    return false;
                }
        return true;
    }

    private $period_start = null;
    private $period_end = null;
    private $is_identical = null;
    private $x_size = null;
    private $y_size = null;

    // konstruktor tworzcy obiekt zwiazany z przedzialem sprawdzanym pod katem okresowosci
    public function __construct($found_id, $current_id, $x, $y){
        $this->is_identical = PeriodFinder::$period_finders;
        $this->period_start = $found_id;
        $this->period_end = $current_id;
        $this->x_size = $x;
        $this->y_size = $y;
    }

    // metoda porownuje kolejne plansze w przedziale i wyklucza wystepowanie okresowosci
    public function next_step($boards)
    {
        $top_id = count($boards) - 1;
        $bottom_id = ($top_id - $this->period_end) + $this->period_start;

        $is_ident = $this->is_identical(
            $boards[$top_id],
            $boards[$bottom_id],
            $this->x_size,
            $this->y_size);

        if (!$is_ident ) {
            unset($this);
            return false;
        }
        else if ($is_ident && $bottom_id >= $this->period_end-1) {
            return true;
        } else {
            return false;
        }
    }
}


// klasa odpowiadajaca za doprowadzenie symulacji na serwerze do konca
// ..do jednego z trzech stanow gry {'okresowy', 'staly', 'wymarly'}
class Automaton{

    private $boards = array();
    private $orginal_board = array();
    private $copy_board = array();
    private $x_size = null;
    private $y_size = null;
    private $status = 'wait';
    private $is_identical = null;

    // kontruktor na podstawie dostarczinych danych konczy symulacje
    // odsyla status koncowy do przegladarki
    public function __construct($simulation, $id){
        if(!is_numeric($id))
            exit();

            $this->boards = $simulation['boards'];
            $this->x_size = count($this->last()) - 1;
            $this->y_size = count($this->last()[0]) - 1;

        if($simulation['state'] === 'evoluating...'){
            $this->is_identical = PeriodFinder::$period_finders;


            do {
                $this->orginal_board = $this->last();
                $this->copy_board = $this->last();

                $this->step();
                switch ($this->status) {
                    case 'period':
                        break;
                    case 'const':
                        break;
                    case 'died':
                        break;
                    case 'wait':
                        break;
                    case 'live':
                        break;
                }
                if (count($this->boards) > 10000) {
                    exit;
                }

            } while ($this->status === 'live');
        }
        else
            $this->status = $simulation['state'];

        $this->send();

        echo json_encode(array(
            'save_status'=>'saved',
            'id'=>$id,
            'boards'=>$this->boards,
            'simulation_status'=>$this->status
        ));
    }

    // wykonuje jeden krok symulacji
    private function step(){
        for($i = 0; $i <= $this->x_size; ++$i)
            for($j = 0; $j <= $this->y_size; ++$j) {
                $neightbours = $this->neighbours_amount($i, $j);
                $this->change_cell(
                    $neightbours,
                    $this->copy_board[$i][$j]
                );
            }
        array_push($this->boards, $this->copy_board);
        $this->check_state();
    }

    // metoda sprawdza czy gra nie jest w jednym z trzech stanow
    private function check_state()
    {
        if ($this->status !== 'wait' && count($this->boards) > 1) {
            if (PeriodFinder::check($this->boards)) {
                $this->status = 'period';
                return;
            }
            else if (PeriodFinder::is_identical($this->last(), $this->penultimate(), $this->x_size, $this->y_size)) {
                $this->status = 'const';
                return;
            }
            else if ($this->is_died()) {
                $this->status = 'died';
                return;
            }
            else {
                $this->status = 'live';
                PeriodFinder::search(
                    $this->boards,
                    $this->last(),
                    $this->x_size,
                    $this->y_size,
                    count($this->boards)
                );
            }
        }
        else if(count($this->boards) > 0){
            $this->status = 'live';
        }
    }

    // metoda sprawdza czy wszystkie komorki sa martwe
    private function is_died(){
        $counter = 0;
        for($i = 0; $i <= $this->x_size; ++$i)
            for($j = 0; $j <= $this->y_size; ++$j) {
                if ($this->last()[$i][$j] === true)
                    ++$counter;
            }

        if($counter===0)
            return true;
        else
            return false;
    }

    //metoda wysyla dokonczona symulacje do bazy danych
    private function send()
    {
        $db = new BaseModel('users');

        $db->update(
            'add',
            array('nick' => $_SESSION['logged']),
            array('simulation' => array(
                'status' => $this->status,
                'data' => $this->boards
            )));
    }

    // metoda zmienia stan komorki w zaleznosci od ilosci sasiadow (wg zasad conwaya)
    private function change_cell($neighbours_amount, &$cell){
        if(!$cell) {
            if ($neighbours_amount === 3)
                $cell = true;
        }
        else
            if($neighbours_amount > 3 || $neighbours_amount < 2)
                $cell = false;
    }

    // metoda oblicza ilosc sasiadujacych zywych komorek (sasiedztwo moore'a)
    private function neighbours_amount($x, $y){
        $counter = 0;

        $x_min = ($x ? $x - 1 : 0 );
        $y_min = ($y ? $y - 1 : 0 );
        $x_max = ($x - $this->x_size ? $x + 1 : $this->x_size );
        $y_max = ($y - $this->y_size ? $y + 1 : $this->y_size );


        for($i = $x_min; $i <= $x_max; ++$i)
            for($j = $y_min; $j <= $y_max; ++$j) {

                if ($this->orginal_board[$i][$j] === true && !($i === $x && $j === $y)) {
                    ++$counter;
                } 
            }
        return $counter;
    }

    // metoda zwraca ostatnia plansze
    private function last(){
        return $this->boards[count($this->boards)-1];
    }

    //metoda zwraca przedostatnia plansze
    private function penultimate(){
            return $this->boards[count($this->boards)-2];
        }


}
