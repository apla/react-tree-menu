"use strict";

var TreeMenuUtils = {

  /**
   * //TODO: use immutable API here..this function mutates!
   *
   * @param lineage
   * @param prevState
   * @param identifier optional
   * @returns {*}
   */
  getNodesForPath: function getNodesForPath(lineage, prevState, identifier) {

    function getTreeNodes(state, nodes) {
      state = state || prevState;
      nodes = nodes || [];
      var id = lineage.shift();
      Object.keys(state).forEach(function (i) {
        var node = state[i];
        var nodeId = identifier ? state[i][identifier] : i;
        if (nodeId === id) {
          nodes.push(state[i]);
          if (lineage.length) {
            getTreeNodes(state[i].children, nodes);
          }
        }
      });

      return nodes;
    }

    return getTreeNodes();
  },

  /**
   * //TODO: use immutable API here..this function mutates!
   *
   * @param lineage
   * @param prevState
   * @param mutatedProperty
   * @param identifier optional
   * @returns {*}
   */
  getNewTreeState: function getNewTreeState(lineage, prevState, mutatedProperty, identifier) {

    function setPropState(node, value) {
      node[mutatedProperty] = value;
      var children = node.children;
      if (children) {
        Object.keys(node.children).forEach(function (ci) {
          var childNode = node.children[ci];
          setPropState(childNode, value);
        });
      }
    }

    function getUpdatedTreeState(state) {
      state = state || prevState;
      var id = lineage.shift();
      Object.keys(state).forEach(function (i) {
        var node = state[i];
        var nodeId = identifier ? state[i][identifier] : i;
        if (nodeId === id) {
          if (!lineage.length) {
            setPropState(state[i], !state[i][mutatedProperty]);
          } else {
            state[i].children = getUpdatedTreeState(state[i].children);
          }
        }
      });

      return state;
    }

    return getUpdatedTreeState();
  }

};

module.exports = TreeMenuUtils;