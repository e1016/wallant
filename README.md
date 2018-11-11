<h1 align="center">Wallant</h1>

<p align="center">New way of handling the state</p>

---
## install
`npm i -s wallant`

## usage

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
```

now we linking store to the component

```js
// import react and stuffs...

import store from './src/Store'

class App extends Component {
  componentDidMount () {
    store.include(this)
  }
  componentWillUnmount () {
    store.exclude(this)
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

Store take control of component when you link it on `componentDidMount` and component is excluded on `componentWillUnmount`, this is for prevent error: `[...] can't call setState or forceUpdate from unmounted component [...]`, in other stores is used a `<Provider>` solution, but we want get control from linking store, and set reactive state only in neccessary components.

---
Now, all this is a simple store, but wallant can do more interesting things...

## persistant

This feature save state automatically and allow restore it when app starts, you only need declare `persistant` as `true` in Wallant constructor.

```js
const store = new Wallant({
  // [...]
  persistant: true,
  // [...]
})
```

default state is loaded to store on first time.

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
