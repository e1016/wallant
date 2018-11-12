import { AsyncStorage } from 'react-native'
import message from './consts'

// used for AscynStorage
const STORE_NAME = '@simplestate:persistantstate:store'

class Wallant {
  constructor ({ state, actions, persistant, validate, computed }) {
    /*
    * 'refs' is used for save
    * mounted components and dispatch
    * reactive update when state change
    */
    this.refs = []
    this.action = {}
    this.persistant = !!persistant 
    this.validate = validate || {}
    this.computed = computed || {}
    this.restored = false

    // may no need restore state
    if (this.persistant)
      this.restoreState()

    if ((typeof state !== 'object') && !(state instanceof Array))
      throw message.SHOULD_BE_OBJECT

    this.state = state

    // preserved state copy for
    // set again when stored state
    // is deleted

    this.provisingState = Object.assign({}, state)

    /*
    * Binding 'this' to all actions
    * is neccessary for use 'this'
    * in action methods
    */

    for (const key in actions) {
      if (typeof actions[key] !== 'function')
        throw message.SHOULD_BE_FUNCTION

      this.action[key] = actions[key].bind(this)
    }
  }

  async restoreState () {
    const state = await AsyncStorage.getItem(STORE_NAME)

    /*
    * NOTE: checking on this...
    */
    if (state)
      this.setState(JSON.parse(state), true)
    else {
      this.setState(
        Object.assign({}, this.provisingState),
        true
      )
      this.restored = true
    }
  }

  saveState () {
    AsyncStorage.setItem(STORE_NAME, JSON.stringify(this.state))
      .then((err, result) => {
        if (err) throw message.STORAGE_INAVALIBLE
      })
  }

  resetState () {
    /*
    * after remove saved state
    * set a copy or original state
    * in running state
    */
    AsyncStorage.removeItem(STORE_NAME)
      .then((err) => {
        if (err)
          throw message.STORAGE_INAVALIBLE

        this.setState(
          Object.assign({}, this.provisingState),
          true
        )
      })
  }

  dispatchUpdateComponents () {
    this.refs.forEach(component =>
      component.forceUpdate()
    )
  }

  setState (state, isCalledFromSelfStore) {
    for (const key in state) {
      let funValidate
      /*
      * we assign and validate than
      * validate key exists in one step
      */

      if (funValidate = this.validate[key]) {
        // assign state meanwhile function return true
        if (funValidate(state[key], this.state[key]) || !this.restored)
          this.state[key] = state[key]
      } else {
        // if isn't declared just assign
        this.state[key] = state[key]
      }
    }

    for (const key in this.computed) {
      const fnCompute = this.computed[key]
      this.state[key] = (fnCompute.bind(this))()
    }

    if (this.persistant) {
      if (isCalledFromSelfStore)
        this.restored = true
      else
        this.saveState()
    }

    this.dispatchUpdateComponents()
  }

  ss (state, isCalledFromSelfStore) {
    /*
    * Only a shorthand
    * for setState method
    */
    this.setState(state, isCalledFromSelfStore)
  }

  include (component) {
    // include new component in refs
    this.refs.push(component)
  }

  exclude (component) {
    /*
    * erasing component from refs, avoid error:
    *
    * can't call setState or forceUpdate
    * from unmounted component [...]
    */
    this.refs = this.refs.filter(ref =>
      ref !== component
    )
  }
}

export default Wallant
