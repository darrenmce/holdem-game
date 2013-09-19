$(function () {

    $('.loader').hide();
    $(document).ajaxStart(function () {
        $('.loader').show();
    });
    $(document).ajaxComplete(function () {
        $('.loader').hide();
    });


    var baseurl = "http://localhost:3000";
    var currentGame = false;

    disableHandler();

    $('#new_btn').on('click', function () {
        $.getJSON(baseurl + '/new', function (resp) {
            $('#gameId_input').val(resp.gameId);
            console.log(resp);
            refreshGame();

        });
    });

    $('#reset_btn').on('click', function () {
        $.getJSON(baseurl + '/reset', function (resp) {
            $('#gameId_input').val('');
            refreshGame();
        });
    });

    $('#getgame_btn').on('click', function () {
        $.getJSON(gameURL(), function (resp) {
            console.log(resp);
            refreshGame();
        });
    });

    $('#player_btn').on('click', function () {
        $.getJSON(gameURL() + '/addplayer/' + $('#player_input').val(), function (resp) {
            $('#player_input').val('');
            refreshGame();
        });
    });

    $('#player_input').keypress(function (e) {
        if (e.which == 13) {
            e.preventDefault();
            if (!$('#player_btn').prop('disabled')) {
                $('#player_btn').click();
            }
        }
    });

    $('#deal_btn').on('click', function () {
        $.getJSON(gameURL() + '/deal', function (resp) {
            refreshGame();
        });
    });
    $('#eval_btn').on('click', function () {
        $.getJSON(gameURL() + '/eval', function (resp) {
            refreshGame();
        });
    });

    $('#test').on('click', function () {
        console.log(currentGame);
    });

    function refreshGame() {

        if ($('#gameId_input').val().length > 0) {
            $.getJSON(baseurl + '/game/' + $('#gameId_input').val(), function (resp) {
                var players = $('#players');
                players.html('');
                $('#community').html('');
                currentGame = resp;
                if (currentGame.game) {
                    var game = currentGame.game;
                    game.hands.forEach(function (hand) {
                        var ele = $('<div></div>').addClass('player');
                        ele.append('<span><b>' + hand.name + '</b></span>');
                        if (game.eval && game.eval[hand.name]) {
                            var perc = parseFloat(Math.round((game.eval[hand.name] * 100) * 100) / 100).toFixed(2);
                            ele.data('eval', perc);
                        }
                        var cards = [];
                        hand.hand.forEach(function (card) {
                            cards.push(card);
                        });
                        ele.data('cards', cards);
                        ele.append(' <span class="eval-span"></span>');
                        ele.append(' <a href="#" class="player-hand">Show Hand</a> <a href="#"class="player-eval">Show %</a>');
                        ele.append('<br/><div class="cards-span"></div>');
                        ele.append('<div style="clear: both;"></div>');

                        players.append(ele);
                    });

                    game.community.forEach(function (card) {
                        $('#community').append(new playingCard(card).getHTML());
                    });

                    //bind the show/hide handlers
                    bindShowHides();

                    disableHandler();
                }

            });
        } else {
            $('#players, #community').html('');
        }

    }

    function gameURL() {
        return baseurl + '/game/' + $('#gameId_input').val();
    }

    function formatCard(str) {
        var card = new playingCard(str);
        return card.getHTML();
    }

    function disableHandler() {
        //if 4 players, disable addplayer
        //if dealt, disable addplayer
        $('#player_btn').prop('disabled', (!currentGame || currentGame.dealt || currentGame.game.hands.length === 4));
        $('#deal_btn').prop('disabled', (!currentGame || currentGame.game.community.length === 5 || currentGame.game.hands.length === 0));
        $('#eval_btn').prop('disabled', (!currentGame || !currentGame.dealt));
    }

    //bind click handlers
    function bindShowHides() {
        $('.player-hand').on('click', function (e) {
            e.preventDefault();
            var $parent = $(this).parent();
            if ($(this).data('shown')) {
                $parent.find('.cards-span').html('');
                $(this).text('Show Hand');
                $(this).data('shown', false);
            } else {
                var cards = $parent.data('cards');
                var cardHtml = '';
                cards.forEach(function (card) {
                    cardHtml += formatCard(card);
                });
                $parent.find('.cards-span').html(cardHtml);

                $(this).text('Hide Hand');
                $(this).data('shown', true);
            }

        });
        $('.player-eval').on('click', function (e) {
            e.preventDefault();
            var $parent = $(this).parent();
            if ($(this).data('shown')) {
                $parent.find('.eval-span').html('');
                $(this).text('Show %');
                $(this).data('shown', false);
            } else {
                var eval = $parent.data('eval') || 0.00;
                $parent.find('.eval-span').html('- ' + eval + '%');
                $(this).text('Hide %');
                $(this).data('shown', true);
            }

        });
    }
});