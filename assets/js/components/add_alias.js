var MentionSelect = require("components/mention_select"),
    AliasActions = require("actions/alias_actions"),
    AliasStore = require("stores/alias_store"),
    AppDispatcher = require("dispatcher/alias_app_dispatcher"),
    _ = require("lodash");

module.exports = React.createClass({

  getInitialState: function () {
    return {
      name_field_error: null,
      mentions: [],
      name: null,
      saving: false,
      roomParticipants: AliasStore.get('roomParticipants')
    }
  },

  componentDidMount: function() {
    AliasStore.on("change", this._onStoreChange);
    AppDispatcher.register(action => {
      switch(action.type) {
        case "alias-saved":
          this.setState({saving: false});
          break;
        default:
          break;
      }
    });
  },

  _onStoreChange: function() {
    var roomParticipants = AliasStore.get('roomParticipants')
    this.setState({ roomParticipants });
  },

  _onNameChange: function(e) {
    let name = e.target.value;
    let name_field_error = this.state.name_field_error;
    if (name.indexOf("@") !== 0 || name.length < 3) {
      name_field_error = "Alias name must start with @ and be longer than 3 characters."
    } else {
      name_field_error = null;
    }

    if (_.some(this.state.roomParticipants, (user) => user.mention_name === name.slice(1))) {
      name_field_error = "Alias name is already used for another user."
    }

    this.setState({
      name: e.target.value,
      name_field_error: name_field_error
    })
  },

  _onMentionsChange: function(mentions) {
    this.setState({
      mentions: mentions
    });
  },

  _onChange: function() {
    this.setState(this._getState());
  },

  _getState: function() {
    return {
      name_field_error: null,
      valid: false
    }
  },

  _saveAlias: function(e) {
    this.setState({
      saving: true
    });
    AliasActions.saveAlias(this.state.name, this.state.mentions);

    e.preventDefault();
  },

  _isValid: function() {
    return _.isNull(this.state.name_field_error) &&
            !_.isNull(this.state.name) &&
            this.state.mentions.length > 0;
  },

  render: function() {

    let nameInputValidationAtrributes = {
      "data-aui-notification-field": true,
      "data-aui-notification-position": "top"
    };


    if (!_.isNull(this.state.name_field_error)) {
      nameInputValidationAtrributes["data-aui-notification-error"] = this.state.name_field_error;
    } else {
      nameInputValidationAtrributes["data-aui-notification-info"] = "Must start with @";
    }

    return (
      <div className="dialog">
        <div className="aui-group instruction">
          <div className="aui-item image">
          </div>
          <div className="aui-item description">
            <h4>Alias</h4>
            <div>
              Do you want to mention a bunch of people at the same time? Alias got
              you covered. It will remember who's who and help you @mention your whole team.
            </div>
          </div>
        </div>
        <form className="aui top-label">
          <div className="aui-group add-new-alias">
              <div className="aui-item name">
                <div className="field-group">

                  <input type="text" className="text" name="alias" placeholder="Alias name..."
                          {...nameInputValidationAtrributes}
                         onChange={this._onNameChange}/>
                </div>
              </div>

              <div className="aui-item mentions">
                <MentionSelect initialMentions={[]}
                               onChange={this._onMentionsChange}/>
              </div>

              <div className="aui-item actions">
                <input className="button submit" type="submit" value="Add" onClick={this._saveAlias}
                        disabled={!this._isValid() || this.state.saving}/>
              </div>
          </div>
        </form>
      </div>
    );
  }


});