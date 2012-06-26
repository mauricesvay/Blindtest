var Deezer = require('./Deezer');
var tracks = require('../data/charts-fr-1956-2012.json');

var dz = new Deezer();

function shuffle(o){
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i, 10), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function getRandomSongFromDB(clbk) {
    var i = Math.floor(Math.random() * tracks.length);
    var track = tracks[i];
    getTrack({
        'year' : track[0],
        'artist' : track[1],
        'title' : track[2],
        'rank' : track[3]
    }, clbk);
}

function suggestionsAreRelevant(suggestions) {
    var l = suggestions.length;
    var c = 0;
    for (var i=0; i<l; i++) {
        if (suggestions[i].name.match(/karaok/i)) {
            c++;
        }
    }
    if ((c / l) > 0.25) {
        //More than half are karaoke ?
        return false;
    }
    return true;
}

function getTrack(row, clbk) {
    var q = row.artist + ' ' + row.title;
    dz.search(q, function(result){

        //Track not found
        if (!result || !result.data || !result.data.length) {
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

                //Skip karaoke suggestions
                if (!suggestionsAreRelevant(suggestions)) {
                    getRandomSongFromDB(clbk);
                    return;
                }

                first.suggestions = shuffle(suggestions);
                first.year = row.year;

                clbk(first);
            });
        }
    });
}

function getRandomSong(clbk) {
    getRandomSongFromDB(clbk);
}

exports.getRandomSong = getRandomSong;