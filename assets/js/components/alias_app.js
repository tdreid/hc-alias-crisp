var React = require("react/addons"),
    AliasActions = require("actions/alias_actions"),
    AliasStore = require("stores/alias_store"),
    Alias = require("components/alias"),
    AddAlias = require("components/add_alias"),
    Spinner = require("components/spinner"),
    _ = require("lodash");

module.exports = React.createClass({

  displayName: "HipChatAliasApp",

  propTypes: {
    aliases: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        alias: React.PropTypes.string.isRequired,
        mentions: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
      })
    ).isRequired
  },

  getInitialState: function () {
    return this._getState()
  },

  componentDidMount: function() {
    AliasStore.on("change", this._onChange);
    AliasActions.fetchAliases();
  },

  componentWillUnmount: function() {
    AliasStore.off("change", this._onChange);
  },

  _onChange: function() {
    this.setState(this._getState());
  },

  _getState: function() {
    return {
      aliases: AliasStore.get("aliases"),
      adding_alias: AliasStore.get("adding_alias"),
      loading: AliasStore.get("loading")
    }
  },

  _renderAlias: function(alias) {
    return <Alias alias={alias.alias}
                  mentions={alias.mentions}/>
  },

  _renderAliases: function() {
    return _.map(this.state.aliases, this._renderAlias);
  },

  _renderAddNew: function() {
    return <AddAlias />;
  },

  _configureNewAlias: function() {
    AliasActions.configureNewAlias();
  },

  render: function() {

    if (this.state.loading) {
      return (
        <div className="dialog">
          <Spinner size="medium"
                   spin={true}/>
        </div>
      );
    }

    if (this.state.adding_alias || this.state.aliases.length === 0) {
      return this._renderAddNew();
    }

    return (
      <div className="dialog">
        <table className="aui aui-table-interactive aliases-container">
          <tbody className="aliases">
            {this._renderAliases()}
          </tbody>
        </table>
        <div>
          <a className="aui-button aui-button-link" onClick={this._configureNewAlias}>Configure a new alias</a>
        </div>


      </div>
    )
  }
});