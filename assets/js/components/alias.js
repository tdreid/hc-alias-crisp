var React = require("react/addons"),
    AliasActions = require("actions/alias_actions"),
    AliasStore = require("stores/alias_store"),
    MentionSelect = require("components/mention_select"),
    _ = require("lodash");

module.exports = React.createClass({

  displayName: "Alias",

  propTypes: {
    alias: React.PropTypes.string.isRequired,
    mentions: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
  },

  getInitialState: function () {
    return {
      edit: false,
      edited_mentions: null
    }
  },

  componentDidMount: function() {
  },

  _onChange: function() {
    this.setState(this._getState());
  },

  _getState: function() {
    return {

    }
  },

  _delete: function(e) {
    AliasActions.deleteAlias(this.props.alias);
    e.stopPropagation();
  },

  _select: function() {
    AliasActions.appendAliasToChat({
      alias: this.props.alias,
      mentions: this.props.mentions
    });
  },

  _edit: function(e) {
    this.setState({
      edit: true
    });

    e.stopPropagation();
  },

  _isValidEdit: function() {
    return false;
  },

  _renderEdit: function() {

    let mentions = this.state.edited_mentions || this.props.mentions;
    let value = mentions.join(",");

    return (
      <tr className="alias edit" data-alias={this.props.alias} key={this.props.alias}>
        <td className="name">
          <span className="hc-mention hc-mention-me">{this.props.alias}</span>
        </td>
        <td className="mentions">
          <MentionSelect initialMentions={mentions}
                         onChange={this._onMentionsChange}/>
        </td>
        <td className="actions aui-compact-button-column">
          <a className="aui-icon aui-icon-small aui-iconfont-success save" onClick={this._saveEdit}
             disabled={!this._isValidEdit()}>Edit</a>
          <a className="aui-icon aui-icon-small aui-iconfont-undo cancel" onClick={this._cancelEdit}>Delete</a>
        </td>
      </tr>
    );
  },

  _getSelectOptions: function(input, callback) {
    AliasActions.getUsers(input, callback);
  },

  _saveEdit: function() {
    AliasActions.updateMentions(this.props.alias, !_.isEmpty(this.state.edited_mentions) ? this.state.edited_mentions : this.props.mentions);
    this.setState({
      edit: false
    });
  },

  _cancelEdit: function() {
    this.setState({
      edit: false
    });
  },

  _onMentionsChange: function(mentions) {
    this.setState({
      edited_mentions: mentions
    });
  },

  render: function() {

    if (this.state.edit) {
      return this._renderEdit();
    }

    let mentions = _.map(this.props.mentions, (mention) => {
      return <span className="hc-mention">{{mention}}</span>
    });

    return (
      <tr className="alias" data-alias={this.props.alias} key={this.props.alias} onClick={this._select}>
        <td className="name">
          <span className="hc-mention hc-mention-me">{this.props.alias}</span>
        </td>
        <td className="mentions">
          {mentions}
        </td>
        <td className="actions aui-compact-button-column">
          <a className="aui-icon aui-icon-small aui-iconfont-edit edit" onClick={this._edit}>Edit</a>
          <a className="aui-icon aui-icon-small aui-iconfont-delete delete" onClick={this._delete}>Delete</a>
        </td>
      </tr>
    )
  }
});