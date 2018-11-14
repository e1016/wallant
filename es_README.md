
<p align="center">
  <img src="https://i.imgur.com/M1JFh4j.png" width="400">
</p>


<p align="center">Persistant, Auto-validate, and computed state container</p>

---

<a href="https://github.com/e1016/wallant/blob/master/README.md">Read the documentation in English</a>

---
## instalación
`npm i -s wallant`

## uso

configuración básica en `/ReactNativeApp/src/Store.js`

```js
import Wallant from 'wallant'

const store = new Wallant({
  persistant: true, // <- el estado persistente viene luego
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

Ahora enlazamos el store a nuestro componente

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

El store toma el control del componente cuando los enlazas en `componentDidMount`, en otros stores se utiliza un `<Provider>`, pero nosotros queremos mantener un poco más de control sobre que componente accede y cual no al store.

---

Ahora, todo hasta este punto es un simple store, pero Wallant puede hacer cosas mas interesante...

## persistant

Esta característica guarda el estado automaticamente cada vez que cambia, y persmite restaurarlo cuando la app de inicia de nuevo, solo debes declarar la propiedad `persistant` como `true` en el constructor de `new Wallant`.


```js
const store = new Wallant({
  // [...]
  persistant: true,
  // [...]
})
```

El estado por default es cargado al store al principio.

---

## actions

Permite modificar el estado de forma mas simple, `this` hace referencia a `store`.

```js
const store = new Wallant({
  state: {
    count: 0
  },
  actions: {
    add () {
      // tip! puedes usar el método `ss`
      // en lugar de 'setState', no hay
      // ninguna diferencia, es solo un
      // shothand

      this.ss({
        count: this.state.count + 1
      })
    }
  }
})
```

Puedes hacer tus actions (y cualquier otra cosa) modular, utilizando el `spread operator`.

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
Wallant te prevee una forma fácil de frenar los estados que no cumplen con ciertas condiciones.

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
Para usarlo, declara (en `validate`) un método con el nombre de la propiedad del estado que quieres validar, por ejemplo `count`, este método será usado para validar el valor de count, si el método retorna `false` el `setState` será rechazado en el key `count`, de lo contrario (`true`) se aplicará. Así de fácil.

---

## computed

Por último pero no menos importante, los _computed peroperties_,  estos puedes hacer tu vida muy fácil, primero declaramos un nodo `computed`. Luego declaramos un método que retorne un valor, por ejemplo:

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

`sevenTimesCount` retorna `count` multiplicado por 7, y tu puedes usarlo como unna variable del `state`.

```js
render () {
  return (
    <Text>{ store.state.sevenTimesCount }</Text>
  )
}
```

Wallant crea una propiedad con el nombre de la función, se cuidadoso, porque los `computed values` son indefinidos mientras el store se crea, por lo que si tratas de iterar sobre un valor que no existe, por ejemplo, para filtrar usuarios:

```js
[...]
computed: {
  filteredUsers () {
    return this.state.users
      .filter(user => user.name.first.startsWith('a'))
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

Obtienes un error tratando de invocar `.map` de `undefined`, **Como resuelves eso?**

  - a) declaras en el state el valor, para que tenga un estado inicial.
  - b) ...

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

`!!store.state.property &&` evita que se evalue lo que está justo despues del mismo, y de esa forma se itera hasta que hay valores en la propierda.
