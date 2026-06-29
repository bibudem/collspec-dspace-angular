function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
import { PluginActionTypes } from "./actions";

/**
 * Updates the global state of the plugin
 *
 * @param {Object} state - the current state
 * @param {Object} action - the action with the new region as payload
 * @returns the modified state if the action type matches
 */
var croppingRegionsReducer = function croppingRegionsReducer(state, action) {
  var _extends2;
  if (state === void 0) {
    state = {};
  }
  if (action === void 0) {
    action = {};
  }
  switch (action.type) {
    case PluginActionTypes.SET_CROPPING_REGION:
      return _extends({}, state, (_extends2 = {}, _extends2[action.windowId] = _extends({}, state[action.windowId], action.region), _extends2));
    default:
      return state;
  }
};
export { croppingRegionsReducer };