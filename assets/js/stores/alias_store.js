var Store = require("./store"),
    AppDispatcher = require("dispatcher/alias_app_dispatcher"),
    _ = require("lodash");


class AliasStore extends Store {

  getDefaults() {
    return {
      aliases: [],
      adding_alias: false,
      loading: true
    };
  }


  registerListeners() {
    this.dispatchToken = AppDispatcher.register(action => {
      switch(action.type) {
        case "aliases-fetched":
          this.set({
            "aliases": action.payload,
            "loading": false
          });
          break;
        case "alias-deleted":
          let newAliases = _.filter(this.data.aliases, (alias) =>  alias.alias !== action.alias);
          this.set("aliases", newAliases);
          break;
        case "alias-updated":
          let updatedAlias = _.find(this.data.aliases, (alias) => alias.alias === action.payload.alias);
          updatedAlias.mentions = action.payload.mentions;
          this.set("aliases", this.data.aliases);
          break;
        case "alias-saved":
          this.set({
            "aliases": action.payload,
            "adding_alias": false
          });
          break;
        case "configure-new-alias":
          this.set({
            "adding_alias": true
          });
          break;
      }
    });
  }
}

module.exports = new AliasStore();
