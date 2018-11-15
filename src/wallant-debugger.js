import meta from '../package.json'

class Debugger {
  constructor (debug) {
    this.debug = debug
    this.completeDebug = (debug === true) ? true : false

    if (this.debug) {
      console.log(
        '%cWallant debug mode%cv' +
        meta.version +
        '%cmods: ' +
        this.debug.join(', '),

        'background-color: #00A1FF; color: white; padding: 2px 10px; border-top-left-radius: 8px; border-bottom-left-radius: 8px;',
        'background-color: black; color: white; padding: 2px 10px;',
        'background-color: #607D8B; color: white; padding: 2px 10px; border-top-right-radius: 8px; border-bottom-right-radius: 8px;',
      )
    }
  }

  printValidate (key, accepted, newValue, oldValue) {
    const values = '%c → %cincoming:%c ' + newValue + ' – %cstored%c: ' + oldValue
    console.log(
      '%cvalidating %c' + key + '%c ' + (accepted ? 'accepted' : 'rejected') + values,

      'padding: 2px 10px; background-color: #673AB7; color: white; border-top-left-radius: 10px; border-bottom-left-radius: 10px;',

      'padding: 2px 10px; background-color: lightgray; border-top-right-radius: 10px; border-bottom-right-radius: 10px; font-weight: bold;',

      'font-weight: bold; color: ' + (accepted ? 'green;' : 'red;'),
      '',
      'color: #673AB7;',
      '',
      'color: #3F51B5;',
      ''
    )
  }

  printFinalState (state) {
    console.log('%cFinal state:', 'background-color: #66BF66; color: black; border-radius: 10px; padding: 2px 10px;', Object.assign({}, state))
    console.log('+ state ················· +')
  }

  printState (state, currentState) {
    console.log('%cIncoming state:', 'background-color: lightgreen; color: black; border-radius: 10px; padding: 2px 10px;', Object.assign({}, state))
    console.log('%cCurrent state:', 'background-color: #7FD27F; color: black; border-radius: 10px; padding: 2px 10px;', Object.assign({}, currentState))
    // console.log(state);
  }

  printComputed () {

  }
}

export default Debugger
