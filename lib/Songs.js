var Deezer = require('./Deezer');
var dz = new Deezer();

function shuffle(o){
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function getRandomSongFromDB(clbk) {
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database('data/FR_charts.sqlite', sqlite3.OPEN_READONLY);

    var query = "SELECT * FROM Songs ORDER BY RANDOM() LIMIT 1";
    db.get(query, function(err, row){
        getTrack(row, clbk);
    });
    db.close();
}

function getTrack(row, clbk) {
    var q = row.artist + ' ' + row.title;
    dz.search(q, function(result){

        //Track not found
        if (!result.data.length) {
            getRandomSongFromDB(clbk);
            return;
        }

        if (result.data.length) {
            var first = result.data.shift();
            var id = first.artist.id;

            dz.getRelatedArtist(id, function(related){
                var suggestions = [];
                suggestions.push({
                    name: first.artist.name,
                    answer: true
                });

                //Not enough suggestions
                if (related.data.length < 4) {
                    getRandomSongFromDB(clbk);
                    return;
                }

                for (var i=0;i<3; i++) {
                    suggestions.push({
                        name : related.data[i].name,
                        answer : false
                    });
                }
                first.suggestions = shuffle(suggestions);
                first.year = row.year;

                clbk(first);
            });
        }
    })
}

function getRandomSong(clbk) {
    getRandomSongFromDB(clbk);
}

exports.getRandomSong = getRandomSong;