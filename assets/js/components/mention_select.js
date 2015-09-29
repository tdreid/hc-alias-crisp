var React = require("react/addons"),
    AliasActions = require("actions/alias_actions"),
    Select = require('react-select'),
    _ = require("lodash");

module.exports = React.createClass({

  getInitialState: function () {
    return {
      mentions: this.props.initialMentions
    }
  },

  _getSelectOptions: function(input, callback) {
    AliasActions.getUsers(input, callback);
  },

  _onMentionsChange: function(val) {
    let mentions = val !== "" ? val.split(",") : [];
    mentions = _.map(mentions, (mention) => {
      if (mention.indexOf("@") !== 0) {
        mention = "@" + mention;
      }

      return mention;
    });


    this.setState({
      mentions: mentions
    });
    this.props.onChange(mentions);
  },

  render: function() {
    let mentions = this.state.mentions;
    let value = mentions.join(",");

    return <Select multi={true}
            allowCreate={true}
            value={value}
            delimitier=","
            asyncOptions={this._getSelectOptions}
            onChange={this._onMentionsChange}/>
  }



});