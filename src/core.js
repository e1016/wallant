import { AsyncStorage } from 'react-native'

import message from './consts'
import Debugger from './debugger'

// used for AscynStorage
const STORE_NAME = '@simplestate:persistantstate:store'

class Wallant extends Debugger {
  constructor ({
    state,
    actions,
    persistant,
    validate,
    computed,
    debug,
    created,
    plugins
  }) {

    super(debug)

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
    this.debug = debug || []
    this.plugins = plugins

    // may no need restore state
    if (this.persistant) {
      this.restoreState()
    }

    if ((typeof state !== 'object') && !(state instanceof Array)) {
      throw message.SHOULD_BE_OBJECT
    }

    this.state = state

    /*
    * preserved state copy for
    * set again when stored state
    * is deleted
    */
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

    /*
    * Only a shorthand
    * for setState method
    */
    this.ss = this.setState

    !!Array.isArray(this.plugins) && this.installPlugins()

    // on create store exec
    !!(typeof created === 'function') && created.apply(this)
  }

  async restoreState () {
    const state = await AsyncStorage.getItem(STORE_NAME)

    /*
    * NOTE: checking on this...
    */
    if (state) {
      this.setState(JSON.parse(state), true)
    } else {
      this.setState(
        Object.assign({}, this.provisingState),
        true
      )
      this.restored = true
    }
  }

  saveState () {
    AsyncStorage.setItem(STORE_NAME, JSON.stringify(this.state))
      .then((err) => {
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

        this.state = {}
        this.setState(
          Object.assign({}, this.provisingState),
          true
        )
      })
  }

  dispatchUpdateComponents () {
    this.refs.forEach(component => {
      if (component.updater.isMounted(component)) {
        component.forceUpdate()
      }
    })
  }

  setState (state, isCalledFromSelfStore) {

    if (this.debug.includes('state') && !isCalledFromSelfStore) {
      this.printState(state, this.state)
    }

    for (const key in state) {
      let fnValidate
      /*
      * we assign and validate than
      * validate key exists in one step
      */

      if (fnValidate = this.validate[key]) {
        // assign state meanwhile function return true
        const accepted = fnValidate(state[key], this.state[key])

        if (this.debug.includes('validate') && !isCalledFromSelfStore) {
          this.printValidate(key, accepted, state[key], this.state[key])
        }

        if (accepted || !this.restored) {
          this.state[key] = state[key]
        }

      } else {
        // if isn't declared just assign
        this.state[key] = state[key]
      }
    }

    for (const key in this.computed) {
      const fnCompute = this.computed[key]
      this.state[key] = (fnCompute.bind(this))()
    }

    if (this.debug.includes('state') && !isCalledFromSelfStore)
      this.printFinalState(this.state)

    if (this.persistant) {
      if (isCalledFromSelfStore) {
        this.restored = true
      } else {
        this.saveState()
      }
    }

    this.dispatchUpdateComponents()
  }

  use (component) {
    // include new component in refs
    if (!this.refs.includes(component)) {
      this.refs.push(component)
    }
  }
  /*
  * plugins implementation inestable
  */
  installPlugins () {
    this.pluginsContext = {}
    this.pluginsFunctions = {}

    this.plugins.forEach(plugin => {
      const context = this.pluginsContext[plugin.name] = {}

      plugin.suscribe.onCreate(this, context)
      
      const pluginNode = this[plugin.name] = {}
      
      for (const funcName in plugin.define) {
        const func = plugin.define[funcName]
        
        pluginNode[funcName] = () => {
          func(this, context, ...arguments)
        }
      }
    })
  }
}

export default Wallant
