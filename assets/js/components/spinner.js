var invariant = require('react/lib/invariant'),
    $ = require("jquery");

module.exports = React.createClass({

  displayName: "Spinner",

  componentWillMount: function () {
    invariant(_.contains(["small", "medium", "large"], this.props.size), "Spinner size must be either small, medium or large");
  },

  getDefaultProps: function() {
    return {
      size: 'medium',
      zIndex: 100
    };
  },

  componentDidMount: function () {
    this._setSpinner();
  },

  componentDidUpdate: function () {
    this._setSpinner();
  },

  _setSpinner: function () {
    var options;

    if (this.refs.spinner) {
      if (this.props.spin) {
        options = this._getOptions();
        AJS.$(React.findDOMNode(this.refs.spinner)).spin(this.props.size, options);
      } else {
        AJS.$(React.findDOMNode(this.refs.spinner)).spinStop();
      }
    }
  },

  _getOptions: function () {
    var options = this.props,
        colorOptions = {
          color: "#000000"
        };

    if (!this.props.color) {
      colorOptions.color = "#000000";
      options = _.merge(options, colorOptions);
    }
    return options;
  },

  render: function(){
    return (
      <div className={"hc-spinner " + ((this.props.spinner_class) ? this.props.spinner_class : "")} ref="spinner"></div>
    );
  }
});
