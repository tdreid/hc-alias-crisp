var React = require('react/addons'),
    AliasApp = require('components/alias_app'),
    AppStore = require("stores/app_store"),
    $ = require("jquery");


var signedRequest = $("meta[name=acpt]").attr("content");
$.ajaxSetup({
  beforeSend: function (request) {
    request.setRequestHeader("X-acpt", signedRequest);
  }
});

var baseUrl = $("meta[name=base-url]").attr("content");
AppStore.set("base_url", baseUrl);

React.render(<AliasApp/>, document.getElementById('react-app'));
