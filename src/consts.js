
const setStateWithoutReturns =
'\n\n\n' +
'store.setState(state => {\n' +
'   // your stuffs\n' +
'   return state <- check for it\n' +
'})\n'

const messages = {
  STATE_SHOULD_BE_OBJECT: '[WALLANT]: TypeError: state argument should be an object type',
  ACTIONS_SHOULD_BE_FUNCTION: '[WALLANT]: TypeError: actions argument should be a function type',
  STORAGE_INAVALIBLE: '[WALLANT]: Persistant state can\'t be used on this device, any is broke about storage',
  FORGOT_RETURN_STATE: '[WALLANT]: setState or ss returns undefined, check for it' + setStateWithoutReturns
}

export default messages
