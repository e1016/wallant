<p>
  <img src="https://img.shields.io/npm/dt/wallant.svg?colorB=8bc34a"/>
  <img src="https://img.shields.io/npm/v/wallant.svg?colorB=f44336"/>
</p>

<p align="center">
  <img src="https://i.imgur.com/M1JFh4j.png" width="400">
</p>

<p align="center">Persistant, auto-validate, and predictable state container for React Native</p>

---

<a href="https://github.com/e1016/wallant/blob/master/es_README.md">Lee la documentación en español</a>

---

## install
`npm i -s wallant`

## use

basic configuration in `/ReactNativeApp/src/Store.js`

```js
import Wallant from 'wallant'

const store = new Wallant({
  persistant: true, // <- persistant state decribed bellow
  state: {
    count: 0
  },
  actions: {
    add () {
      this.setState({
        count: this.state.count + 1
      })
    },
    sub () {
      this.setState({
        count: this.state.count - 1
      })
    }
  }
})

export default store
```

now we linking store to the component

```js
// import react and stuffs...

import store from './src/Store'

class App extends Component {
  componentDidMount () {
    store.use(this)
  }
  render () {
    return (
      <View style={ styles.container }>
        <Text>{ store.state.count }</Text>
        <Button
          title="add to the counter"
          onPress={ store.action.add }/>
      </View>
    )
  }
}
```

Store take control of component when you link it on `componentDidMount`, in other stores is used a `<Provider>` solution, but we want get control from linking store, and set reactive state only in neccessary components.

---
Now, all this is a simple store, but wallant can do more interesting things...

## persistant

> [ DEPRECATED in 2.0 ] This feature save state automatically and allow restore it when app starts, you only need declare `persistant` as `true` in Wallant constructor. 

We detect an important performance leak for automatically save state in phone some times, for example, when you set state on change text event. We resolve this creating a `commit` behavior, `persistant: true` still working. TextInput example implementation.

```js
// store
const store = new Wallant({
  // [...]
  persistant: true,
  // [...]
})


<TextInput
  onEndEditing={() =>
    store.commit() // saves state in storage
  }
  onChangeText={text =>
    store.action.updateText(text) // update state
  }/>
```

default state is loaded to store on first time.

You can detect if store state is restored checking for `store.restored` is a boolean, meanwhile store.restored is false, state is restoring, and is true after that.

```js
render () {
  return store.restored (
    <View>
      <Text>State is restored!</Text>
    </View>
  ) : (
    <View>
      <Text>State is restoring...</Text>
    </View>
  )
}
```

Reset state it's easy, use `store.resetState()` and it's all.


---

## actions

Actions allow you modify state, `this` make reference to `store`.

```js
const store = new Wallant({
  state: {
    count: 0
  },
  actions: {
    add () {
      // tip! you can use 'ss' method
      // instead of 'setState', there
      // is not diferences, it's only
      // a short hand

      this.ss({
        count: this.state.count + 1
      })
    }
  }
})
```

Use a callback for update state

```js
// ss === setState 
this.ss(state => {
  state.someKey = 'A new value'
  state.otherKey = {
    propOne: 'val 1',
    propTwo: 'val 2'
  }
  return state
}).commit() // <- persistant state
```

You can make actions (and any) modular easy using spread operator.

```js
const counterActions = {
  add () {
    this.ss({
      count: this.state.count + 1
    })
  },
  sub () {
    this.ss({
      count: this.state.count - 1
    })    
  }
}

const store = new Wallant({
  persistant: true,
  state: {
    count: 0
  },
  actions: {
    ...counterActions,
    ...otherActions
  }
})

```

---

## validate

Wallant provides and easy way to break bad states.

```js
const store = new Wallant({
  persistant: true,
  state: {
    count: 0
  },
  actions: {
    ...counterActions
  },
  validate: {
    count (oldValue, newValue) {
      return newValue < 20
    }
  }
})
```

For use, declare on methods with the name of property in state, for example `count`, this method will be used for validate count states in state, if method return false setState will be rejected in `count` key, else will be applied. That easy!

---

## computed

And last, computed properties, this can be your life so easy, first you need declare a new node `computed`.

and declarea a function than use state and return a computed value, for example:

```js
const store = new Wallant({
  persistant: true,
  state: {
    count: 0
  },
  actions: { ... },
  validate: { ... },
  // and computed
  computed: {
    sevenTimesCount () {
      return this.state.count * 7
    }
  }
})
```

`sevenTimesCount` return `count` multiplied seven times, and you can use this in React component as a property.

```js
render () {
  return (
    <Text>{ store.state.sevenTimesCount }</Text>
  )
}
```

Wallant creates a key named as computed funcion, be care, because this values are `undefined` meanwhile store is created, btw, if you are computing for example an array for filter users:

```js
[...]
computed: {
  filteredUsers () {
    return this.state.users
      .filter(user => user.name.startsWith('a'))
      .map(({ name }) => name.first + ' ' + name.last)
  }
}
[...]


render () {
  return (
    <View>
      {
        store.state.filteredUsers.map(i =>
          [...]
        )
      }
    </View>
  )
}
```

Get an error trying to invoke `.map` of `undefined`. **How to solve this?**

```js
render () {
  return (
    <View>
      {
        !!store.state.filteredUsers &&
        store.state.filteredUsers.map(i =>
          [...]
        )
      }
    </View>
  )
}
```

`!!store.state.property &&` avoid render of element bellow meanwhile property in store is `undefined`.

---
### Flow
<p align="center">
  <img src="https://i.imgur.com/tkJjZZ6.png" alg="Wallant data flow">
</p>
