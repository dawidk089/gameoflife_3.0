/**
 * funkcja wysylajaca do serwera polecenie usuniecia symulacji z baz danych
 */
var delete_simulation = function() {

    $("input[name='delete']").prop('disabled', true);

    $.ajax( appl_path + "SimList/delete_simulation", {
        type: "POST",
        data: {
            id: $(this).siblings("input[type='hidden']").attr('value')
        },
        statusCode: {
            404: function() {
                console.error("[404]");
            },
            200: function() {
                console.error("[200]");
                location.reload();
            },
            0: function () {
                console.error("[000]");
            },
            500: function () {
                console.error("[500]");
            }
        }
    });
};

