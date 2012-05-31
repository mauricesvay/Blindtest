var http = require('http');
var querystring = require('querystring');

var Deezer = function() {
    this.host = 'api.deezer.com';
    this.base = '/2.0/';
}

Deezer.prototype.search = function(q, clbk) {
    this.request({
        'method' : 'search',
        'params' : { 'q' : q }
    }, clbk);
}

Deezer.prototype.getAlbum = function(id, clbk) {
    this.request({
        'method' : 'album',
        'id' : id
    }, clbk);
}

Deezer.prototype.getArtist = function(id, clbk) {
    this.request({
        'method' : 'artist',
        'id' : id
    }, clbk);
}

Deezer.prototype.getRelatedArtist = function(id, clbk) {
    this.request({
        'method' : 'artist',
        'id' : id + '/related'
    }, clbk);
}

Deezer.prototype.getTrack = function(id, clbk) {
    this.request({
        'method' : 'track',
        'id' : id
    }, clbk);
}

Deezer.prototype.request = function(options, clbk) {
    var self = this;

    var method = options.method;
    var id = options.id || null;
    var params = options.params || {};

    var path = self.base + method;
    if (id) {
        path += '/' + id;
    }
    if (params) {
        path += '?' + querystring.stringify(params);
    }

    if (method) {
        http.get({
            'host' : self.host,
            'method' : 'GET',
            'port' : 80,
            'path' : path
        }, function(response){
            var out = '';
            response.on('data', function(chunk){
                out += chunk;
            });
            response.on('end', function(){
                clbk(JSON.parse(out));
            });
        });
    }
}

module.exports = Deezer;