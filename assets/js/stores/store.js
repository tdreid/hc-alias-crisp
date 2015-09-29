var EventEmitter = require("events").EventEmitter,
    _ = require("lodash");


function toArray(obj) {
  if (_.isArray(obj)) {
    return obj;
  } else {
    return [obj];
  }
}

class Store extends EventEmitter {

  constructor() {

    super();

    this.data = this.getDefaults();

    this.registerListeners();
  }

  has(key) {
    return this.data.hasOwnProperty(key);
  }

  get(key) {
    return this.data[key];
  }

  getAll() {
    return this.data;
  }

  setIfNotEqual(key, value) {
    var data = key;

    if (value !== undefined) {
      data = {};
      data[key] = value;
    }

    this.doSet(data, true);
  }

  set(key, value) {
    var data = key;

    if (value !== undefined) {
      data = {};
      data[key] = value;
    }

    this.doSet(data, false);
  }

  doSet(data, doEqualityCheck) {
    var changeset = {};
    var hasChange = false;

    _.keys(data).forEach(function (key) {

      var shouldSet = !doEqualityCheck || (doEqualityCheck && !_.isEqual(data[key], this.data[key]));

      if (shouldSet) {
        hasChange = true;
        var oldValue = this.get(key),
                value = data[key];

        this.data[key] = value;
        changeset[key] = value;
        this.emit("change:" + key, value, oldValue);
      }

    }, this);

    if (!doEqualityCheck || (doEqualityCheck && hasChange)) {
      this.emit("change", changeset);
    }
  }

  unset(key) {
    if (this.has(key)) {
      var oldValue = this.get(key);
      delete this.data[key];

      this.emit("change:" + key, undefined, oldValue);
    }
  }

  clear() {
    var changeset = {};

    _.keys(this.data).forEach(function (key) {
      changeset[key] = this.get(key);
      this.unset(key);
    }, this);

    this.emit("change", changeset);
  }

  /**
   * Registers listeners.
   */
  registerListeners() {}

  /**
   * Returns the default value of the store
   */
  getDefaults() {
    return {};
  }

  reset(){
    this.data = this.getDefaults();
  }

  on(type, callback) {
    toArray(type).forEach(t => super.on.call(this, t, callback));
  }

  once(type, callback) {
    toArray(type).forEach(t => super.once.call(this, t, callback));
  }

  off(type, callback) {
    toArray(type).forEach(t => super.removeListener.call(this, t, callback));
  }
}

module.exports = Store;