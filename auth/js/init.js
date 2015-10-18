window.onload = function () {
    /**
     * po zaladowaniu strony inicjowane sa uchwyty na zdarzenia sprawdzania identycznosci pol (valid_identical);
     * sa wywolywane kazdorazowo po wpisaniu litery
     */
    register.valid_identical('#registration', 'email', 'email_repeat', 'Podane adresy email nie są identyczne.');
    register.valid_identical('#registration', 'password', 'password_repeat', 'Podane hasła nie są identyczne.');
};



register = {
    valid_state: false,

    /**
     * uniwersalna funkcja do porownywania pol pod wzgledem identycznosci;
     * wyswietla status, gdy pola nie sa identyczne
     * @param scope -- otoczenie; id w html
     * @param original -- pierwsze pole
     * @param compared -- drugie pole
     * @param message -- tekst w pasku statusu
     */
    valid_identical: function(scope, original, compared, message){

        var fun = function(){
            var first = $(scope+' [name="'+original+'"]').val();
            var second = $(scope+' [name="'+compared+'"]').val();
            if(first !== second) {
                $('#status').text(message);
                $(scope+' [type="submit"]').prop('disabled', true);
            }
            else {
                $('#status').text('');
                $(scope+' [type="submit"]').prop('disabled', false);
            }
        };

        $(scope+' [name='+original+'], '+scope+' [name='+compared+']').on('focus', function(){
            $(this).on('keyup', fun);
        }).on('focusout', function(){
            $(this).off('keyup', fun)
        });

    }



};