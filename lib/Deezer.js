const http = require("http");
const querystring = require("querystring");

class Deezer {
  constructor() {
    this.host = "api.deezer.com";
    this.base = "/2.0/";
  }

  search(q) {
    return this.request({
      method: "search",
      params: { q: q },
    });
  }

  getAlbum(id) {
    return this.request({
      method: "album",
      id: id,
    });
  }

  getArtist(id) {
    return this.request({
      method: "artist",
      id: id,
    });
  }

  getRelatedArtist(id) {
    return this.request({
      method: "artist",
      id: id + "/related",
    });
  }

  getTrack(id) {
    return this.request({
      method: "track",
      id: id,
    });
  }

  request(options) {
    const method = options.method;
    const id = options.id || null;
    const params = options.params || {};

    let path = this.base + method;
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
            host: this.host,
            method: "GET",
            port: 80,
            path: path,
          },
          (response) => {
            let out = "";
            response.on("data", (chunk) => {
              out += chunk;
            });
            response.on("end", () => {
              resolve(JSON.parse(out));
            });
          }
        );
      } else {
        reject();
      }
    });
  }
}

module.exports = Deezer;
