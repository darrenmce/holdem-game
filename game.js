var ps = require('poker-sim');
var express = require('express');
var redis = require('redis');

var db = redis.createClient(6379, '127.0.0.1');
db.on("error", function (err) {
    console.log("Error " + err);
});

//all active games
var games = {};

var app = express();

function saveGame(gameId) {
    db.set('ps-game-' + gameId, JSON.stringify(games[gameId].game.getSave()));
}

//main page retrieval
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/client/app/index.html');
});

//bower script retrieval
app.get('/client/app/bower_components/:component/:file', function (req, res) {
    res.sendfile(__dirname + '/client/app/bower_components/' + req.params.component + '/' + req.params.file);
});

//app script retrieval
app.get('/scripts/:file', function (req, res) {
    res.sendfile(__dirname + '/client/app/scripts/' + req.params.file);
});

//img retrieval
app.get('/img/:file', function (req, res) {
    res.sendfile(__dirname + '/client/app/img/' + req.params.file);
});

//get a new game
app.get('/new', function (req, res) {
    db.incr('ps-gameincr', function (err, reply) {
        var gameId = reply;

        games[gameId] = {
            game: new ps.Game(),
            dealt: false,
            community: 0
        };
        saveGame(gameId);
        res.send({
            gameId: gameId
        });
    });
});

app.get('/reset', function (req, res) {
    db.set('ps-gameincr', "0", redis.print);
    //empty games
    games = {};
    //clear DB of games
    db.keys('ps-game-*', function (err, keys) {
        keys.forEach(function (key) {
            console.log('deleting game: ' + key);
            db.del(key);
        });
    });
    res.send({
        status: true
    });
});

app.get('/game/:gameId', function (req, res) {
    var gameId = req.params.gameId;
    var gameObj = games[gameId] || false;
    if (gameObj.game) {
        var game = gameObj.game;
        res.send({
            game: game.getGame(),
            dealt: gameObj.dealt
        });
    } else {
        //retrieve game from database
        db.get('ps-game-' + gameId, function (err, data) {

            var gameSave = JSON.parse(data);
            var newGame = new ps.Game(gameSave);
            games[gameId] = {
                game: newGame,
                dealt: newGame.cardsDealt === 2,
                community: newGame.community.length
            };

            gameObj = games[gameId];
            console.log(gameObj);


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
    }
});

//addplayer
app.get('/game/:gameId/addplayer/:player', function (req, res) {
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

//deal! only gets called once per game
app.get('/game/:gameId/deal', function (req, res) {
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
