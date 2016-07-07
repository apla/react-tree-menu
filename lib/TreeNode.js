'use strict';

var React = require('react'),
    TreeNodeMixin = require('./TreeNodeMixin');

/**
 * Individual nodes in tree hierarchy, nested under a single <TreeMenu/> node
 *
 *
 * @type {TreeNode}
 */
var TreeNode = React.createClass({
  displayName: 'TreeNode',


  mixins: [TreeNodeMixin],

  propTypes: {

    stateful: React.PropTypes.bool,
    checkbox: React.PropTypes.bool,
    collapsible: React.PropTypes.bool,
    collapsed: React.PropTypes.bool,
    expandIconClass: React.PropTypes.string,
    collapseIconClass: React.PropTypes.string,
    checked: React.PropTypes.bool,
    label: React.PropTypes.string.isRequired,
    classNamePrefix: React.PropTypes.string,
    onClick: React.PropTypes.func,
    onCheckChange: React.PropTypes.func,
    onSelectChange: React.PropTypes.func,
    onCollapseChange: React.PropTypes.func,
    labelFilter: React.PropTypes.func,
    labelFactory: React.PropTypes.func,
    checkboxFactory: React.PropTypes.func

  },

  getInitialState: function getInitialState() {
    return {};
  },

  getDefaultProps: function getDefaultProps() {
    return {
      stateful: false,
      collapsible: true,
      collapsed: false,
      checkbox: false,
      onClick: function onClick(lineage) {
        console.log("Tree Node clicked: " + lineage.join(" > "));
      },
      onCheckChange: function onCheckChange(lineage) {
        console.log("Tree Node indicating a checkbox check state should change: " + lineage.join(" > "));
      },
      onCollapseChange: function onCollapseChange(lineage) {
        console.log("Tree Node indicating collapse state should change: " + lineage.join(" > "));
      },
      checked: false,
      expandIconClass: "",
      collapseIconClass: "",
      labelFactory: function labelFactory(labelClassName, displayLabel) {
        return React.createElement(
          'label',
          { className: labelClassName },
          displayLabel
        );
      },
      checkboxFactory: function checkboxFactory(className, isChecked) {
        return React.createElement('input', {
          className: className,
          type: 'checkbox',
          checked: isChecked,
          onChange: function onChange() {} });
      }
    };
  },

  _getCollapseNode: function _getCollapseNode() {
    var props = this.props,
        collapseNode = null;

    if (props.collapsible) {
      var collapseClassName = this._getRootCssClass() + "-collapse-toggle ";
      var collapseToggleHandler = this._handleCollapseChange;
      if (!props.children || props.children.length === 0) {
        collapseToggleHandler = function () {};
        collapseClassName += "collapse-spacer";
      } else {
        collapseClassName += this._isCollapsed() ? props.expandIconClass : props.collapseIconClass;
      }
      collapseNode = React.createElement('span', { onClick: collapseToggleHandler, className: collapseClassName });
    }
    return collapseNode;
  },

  render: function render() {
    return React.createElement(
      'div',
      { className: this._getRootCssClass() },
      this._getCollapseNode(),
      React.createElement(
        'span',
        { onClick: this._handleClick },
        this._getCheckboxNode(),
        this._getLabelNode()
      ),
      this._getChildrenNode()
    );
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {

    if (!this._isStateful()) return;

    var mutations = {};

    if (this.props.checked !== nextProps.checked) {
      mutations.checked = nextProps.checked;
    }

    this.setState(mutations);
  },

  _getRootCssClass: function _getRootCssClass() {
    return this.props.classNamePrefix + "-node";
  },

  _getChildrenNode: function _getChildrenNode() {

    var props = this.props;

    if (this._isCollapsed()) return null;

    var children = props.children;

    if (this._isStateful()) {
      var state = this.state;
      children = React.Children.map(props.children, function (child) {
        return React.cloneElement(child, {
          key: child.key,
          ref: child.ref,
          checked: state.checked
        });
      });
    }

    return React.createElement(
      'div',
      { className: this._getRootCssClass() + "-children" },
      children
    );
  },

  _getLabelNode: function _getLabelNode() {

    var props = this.props,
        labelClassName = props.classNamePrefix + "-node-label";

    if (this._isSelected()) {
      labelClassName += " selected";
    }

    var displayLabel = props.label;

    if (props.labelFilter) displayLabel = props.labelFilter(displayLabel);

    return this.props.labelFactory(labelClassName, displayLabel, this._getLineage());
  },

  _getCheckboxNode: function _getCheckboxNode() {
    var props = this.props;
    if (!props.checkbox) return null;

    return this.props.checkboxFactory(props.classNamePrefix + "-node-checkbox", this._isChecked(), this._getLineage());
  },

  _isStateful: function _isStateful() {

    return this.props.stateful ? true : false;
  },

  _isChecked: function _isChecked() {

    if (this._isStateful() && typeof this.state.checked !== "undefined") return this.state.checked;
    return this.props.checked;
  },

  _isSelected: function _isSelected() {

    if (this._isStateful() && typeof this.state.selected !== "undefined") return this.state.selected;
    return this.props.selected;
  },

  _isCollapsed: function _isCollapsed() {

    if (this._isStateful() && typeof this.state.collapsed !== "undefined") return this.state.collapsed;

    if (!this.props.collapsible) return false;

    return this.props.collapsed;
  },

  _handleClick: function _handleClick() {
    if (this.props.checkbox) {
      return this._handleCheckChange();
    } else if (this.props.onSelectChange) {
      return this._handleSelectChange();
    }

    this.props.onClick(this._getLineage());
  },

  _toggleNodeStateIfStateful: function _toggleNodeStateIfStateful(field) {
    if (this._isStateful()) {
      var newValue = !this.props[field];
      if (typeof this.state[field] !== "undefined") {
        newValue = !this.state[field];
      }
      var mutation = {};
      mutation[field] = newValue;
      console.log(mutation);
      this.setState(mutation);
    }
  },

  _handleCheckChange: function _handleCheckChange() {

    this._toggleNodeStateIfStateful("checked");

    this.props.onCheckChange(this._getLineage());
  },

  _handleSelectChange: function _handleSelectChange() {

    this._toggleNodeStateIfStateful("selected");

    this.props.onSelectChange(this._getLineage());
  },

  _handleCollapseChange: function _handleCollapseChange() {

    this._toggleNodeStateIfStateful("collapsed");

    this.props.onCollapseChange(this._getLineage());
  },

  _getLineage: function _getLineage() {

    return this.props.ancestor.concat(this.props.id);
  }

});

module.exports = TreeNode;