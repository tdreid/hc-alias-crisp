var AppDispatcher = require("dispatcher/alias_app_dispatcher"),
    AppStore = require("stores/app_store"),
    $ = require("jquery"),
    AP = require("AP"),
    _ = require("lodash");

var AliasActions = {

  fetchAliases: function() {
    let baseUrl = AppStore.get("base_url");
    $.ajax({
      url: baseUrl + "/alias",
      type: "GET",
      dataType: "json"
    }).done(function(data) {
      AppDispatcher.dispatch({
        type: "aliases-fetched",
        payload: data
      });
    });
  },

  deleteAlias: function(aliasName) {
    let baseUrl = AppStore.get("base_url");
    $.ajax({
      url: baseUrl + "/alias/" + aliasName,
      type: "DELETE"
    }).done(function() {
      AppDispatcher.dispatch({
        type: "alias-deleted",
        alias: aliasName
      });
    });
  },

  appendAliasToChat: function(alias) {
    let mentionsText = alias.alias + ": ";
    _.each(alias.mentions, (mention) => {
      mentionsText += mention + " ";
    });

    AP.require(["chat", "dialog"], function(chat, dialog) {
      chat.appendMessage(mentionsText);
      dialog.close({
        key: "alias.dialog"
      });
    });
  },

  getUsers: function(input, callback) {
    let baseUrl = AppStore.get("base_url");
    $.ajax({
      url: baseUrl + "/room_participants",
      type: "GET",
      dataType: "json"
    }).done(function(users) {
      let options = _.map(users, (user) => {
        return {
          value: "@" + user.mention_name,
          label: "@" + user.mention_name
        }
      });

      callback(null, {
        options: options,
        complete: true
      });
    });
  },

  updateMentions: function(aliasName, mentions) {
    let baseUrl = AppStore.get("base_url");
    $.ajax({
      url: baseUrl + "/alias/" + aliasName,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify({
        mentions: mentions
      })
    }).done(function() {
      AppDispatcher.dispatch({
        type: "alias-updated",
        payload: {
          alias: aliasName,
          mentions: mentions
        }
      });
    });
  },

  saveAlias: function(aliasName, mentions) {
    let baseUrl = AppStore.get("base_url");
    $.ajax({
      url: baseUrl + "/alias/" + aliasName,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        mentions: mentions
      }),
      dataType: "json"
    }).done(function(data) {
      AppDispatcher.dispatch({
        type: "alias-saved",
        payload: data
      });
    });
  },

  configureNewAlias: function() {
    AppDispatcher.dispatch({
      type: "configure-new-alias"
    });
  }
};

module.exports = AliasActions;