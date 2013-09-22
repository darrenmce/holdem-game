var pokersim = require('poker-sim');
var express = require('express');
var redis = require('redis');
var _ = require('underscore');

var app = express();
//get args
var args = process.argv.splice(2, process.argv.length);

//nodb flag
var dbmode = args.indexOf('--nodb') < 0;

//log flag
if (args.indexOf('-l') >= 0) {
    console.log('enabling logger');
    app.use(express.logger());
}

var db = dbmode ? redis.createClient() : false;

if (dbmode) {
    db.on("error", function (err) {
        console.log("Error " + err);
    });
}
//all active games
var games = {};

function output(message){
    console.log('*** '+message+' ***');
}
function saveGame(gameId) {
    if (dbmode) {
        db.set('ps-game-' + gameId, JSON.stringify(games[gameId].game.getSave()));
    }
}

//main page retrieval
app.get('/', function (req, res) {
    output('get /');
    res.sendfile(__dirname + '/client/app/index.html');
});

//bower script retrieval
app.get('/client/app/bower_components/:component/:file', function (req, res) {
    output('get bower_component: '+req.params.component+'/'+req.params.file);
    res.sendfile(__dirname + '/client/app/bower_components/' + req.params.component + '/' + req.params.file);
});

//app script retrieval
app.get('/scripts/:file', function (req, res) {
    output('get script: '+req.params.file);
    res.sendfile(__dirname + '/client/app/scripts/' + req.params.file);
});

//img retrieval
app.get('/img/:file', function (req, res) {
    output('get img: '+req.params.file);
    res.sendfile(__dirname + '/client/app/img/' + req.params.file);
});

//get a new game
app.get('/new', function (req, res) {
    output('get new game.');
    if (dbmode) {
        db.incr('ps-gameincr', function (err, reply) {
            var gameId = reply;

            games[gameId] = {
                game: new pokersim.Game(),
                dealt: false,
                community: 0
            };
            saveGame(gameId);
            res.send({
                gameId: gameId
            });
        });
    } else {
        var gameId = _.size(games) + 1;
        games[gameId] = {
            game: new pokersim.Game(),
            dealt: false,
            community: 0
        };
        res.send({
            gameId: gameId
        });
    }
});

app.get('/reset', function (req, res) {
    output('reset games/db.');

    //empty games
    games = {};

    if (dbmode) {
        db.set('ps-gameincr', "0", redis.print);
        //clear DB of games
        db.keys('ps-game-*', function (err, keys) {
            keys.forEach(function (key) {
                console.log('deleting game: ' + key);
                db.del(key);
            });
        });
    }

    res.send({
        status: true
    });
});

app.get('/game/:gameId', function (req, res) {
    output('get game: ' + req.params.gameId);

    var gameId = req.params.gameId;
    var gameObj = games[gameId] || false;
    if (gameObj.game) {
        var game = gameObj.game;
        res.send({
            game: game.getGame(),
            dealt: gameObj.dealt
        });
    } else if (dbmode){
        //retrieve game from database
        db.get('ps-game-' + gameId, function (err, data) {

            var gameSave = JSON.parse(data);
            var newGame = new pokersim.Game(gameSave);
            games[gameId] = {
                game: newGame,
                dealt: newGame.cardsDealt === 2,
                community: newGame.community.length
            };

            gameObj = games[gameId];
            if (gameObj) {
                var game = gameObj.game;
                if (game) {
                    res.send({
                        game: game.getGame(),
                        dealt: gameObj.dealt
                    });
                } else {
                    res.send({status: false});
                }
            } else {
                res.send({status: false});
            }
        });
    } else {
        res.send({status: false});
    }
});

//addplayer
app.get('/game/:gameId/addplayer/:player', function (req, res) {
    output('add player: ' + req.params.player+ ' to game: ' + req.params.gameId);

    var gameId = req.params.gameId;
    var gameObj = games[gameId] || false;
    if (gameObj.game) {
        var game = gameObj.game;
        game.addHand(req.params.player);
        saveGame(gameId);
        res.send({status: true});
    } else {
        res.send({status: false});
    }
});

//deal! either deals to players, or turns community cards
app.get('/game/:gameId/deal', function (req, res) {
    output('deal to game: ' + req.params.gameId);

    var gameId = req.params.gameId;
    var gameObj = games[gameId] || false;
    if (gameObj.game) {
        var game = gameObj.game;
        if (!gameObj.dealt) {
            game.dealCard().dealCard();
            gameObj.dealt = true;

        } else {
            if (gameObj.community === 0) {
                game.communityCard().communityCard().communityCard();
                gameObj.community += 3;
            } else if (gameObj.community < 5) {
                game.communityCard();
                gameObj.community++;
            }

        }
        saveGame(gameId);
        res.send({status: true});
    } else {
        res.send({status: false});
    }

});

//evaluate game (can only be called once game has dealt)
app.get('/game/:gameId/eval', function (req, res) {
    output('evaluate  game: ' + req.params.gameId);

    var gameId = req.params.gameId;
    var gameObj = games[gameId] || false;
    if (gameObj.game && gameObj.dealt) {
        var game = gameObj.game;
        game.evalHands();
        saveGame(gameId);
        res.send({status: true});
    } else {
        res.send({status: false});
    }
});


var port = 3000;
app.listen(port);
console.log('Listening on port ' + port);


//db.quit();
