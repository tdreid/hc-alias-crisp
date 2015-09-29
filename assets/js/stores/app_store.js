var Store = require("./store");


class AppStore extends Store {

  getDefaults() {
    return {
      base_url: ""
    };
  }
}

module.exports = new AppStore();