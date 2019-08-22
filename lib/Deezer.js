var http = require("http");
var querystring = require("querystring");

var Deezer = function() {
  this.host = "api.deezer.com";
  this.base = "/2.0/";
};

Deezer.prototype.search = function(q) {
  return this.request({
    method: "search",
    params: { q: q }
  });
};

Deezer.prototype.getAlbum = function(id) {
  return this.request({
    method: "album",
    id: id
  });
};

Deezer.prototype.getArtist = function(id) {
  return this.request({
    method: "artist",
    id: id
  });
};

Deezer.prototype.getRelatedArtist = function(id) {
  return this.request({
    method: "artist",
    id: id + "/related"
  });
};

Deezer.prototype.getTrack = function(id) {
  return this.request({
    method: "track",
    id: id
  });
};

Deezer.prototype.request = function(options) {
  var self = this;

  var method = options.method;
  var id = options.id || null;
  var params = options.params || {};

  var path = self.base + method;
  if (id) {
    path += "/" + id;
  }
  if (params) {
    path += "?" + querystring.stringify(params);
  }

  return new Promise((resolve, reject) => {
    if (method) {
      http.get(
        {
          host: self.host,
          method: "GET",
          port: 80,
          path: path
        },
        function(response) {
          var out = "";
          response.on("data", function(chunk) {
            out += chunk;
          });
          response.on("end", function() {
            resolve(JSON.parse(out));
          });
        }
      );
    } else {
      reject();
    }
  });
};

module.exports = Deezer;
