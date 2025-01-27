import React from 'react'

// preloads our fallback image
document.createElement('img').src = '/img/pokemon/fallback-pokemon.jpg'

// this is just a hacky error boundary for handling any errors in the app
// it just shows "there was an error" with a button to try and re-render
// the whole app over again.
// In a regular app, I recommend using https://npm.im/react-error-boundary
// and reporting errors to a monitoring service.
class ErrorBoundary extends React.Component {
  state = {error: null}
  static getDerivedStateFromError(error) {
    return {error}
  }
  componentDidCatch() {
    // log the error to the server
  }
  tryAgain = () => this.setState({error: null})
  render() {
    return this.state.error ? (
      <div>
        There was an error. <button onClick={this.tryAgain}>try again</button>
        <pre style={{whiteSpace: 'normal'}}>{this.state.error.message}</pre>
      </div>
    ) : (
      this.props.children
    )
  }
}

function PokemonInfoFallback({name}) {
  const initialName = React.useRef(name).current
  const fallbackPokemonData = {
    name: initialName,
    number: 'XXX',
    attacks: {
      special: [
        {name: 'Loading Attack 1', type: 'Type', damage: 'XX'},
        {name: 'Loading Attack 2', type: 'Type', damage: 'XX'},
      ],
    },
    fetchedAt: 'loading...',
  }
  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src="/img/pokemon/fallback-pokemon.jpg" alt={initialName} />
      </div>
      <PokemonDataView pokemon={fallbackPokemonData} />
    </div>
  )
}

function PokemonDataView({pokemon}) {
  return (
    <>
      <section>
        <h2>
          {pokemon.name}
          <sup>{pokemon.number}</sup>
        </h2>
      </section>
      <section>
        <ul>
          {pokemon.attacks.special.map(attack => (
            <li key={attack.name}>
              <label>{attack.name}</label>:{' '}
              <span>
                {attack.damage} <small>({attack.type})</small>
              </span>
            </li>
          ))}
        </ul>
      </section>
      <small className="pokemon-info__fetch-time">{pokemon.fetchedAt}</small>
    </>
  )
}

// 🚨 This should NOT be copy/pasted for production code and is only here
// for experimentation purposes. The API for suspense (currently throwing a
// promise) is likely to change before suspense is officially released.
// This was strongly inspired by work done in the React Docs by Dan Abramov
function createResource(asyncFn) {
  let status = 'pending'
  let result
  let promise = asyncFn().then(
    r => {
      status = 'success'
      result = r
    },
    e => {
      status = 'error'
      result = e
    },
  )
  return {
    read() {
      if (status === 'pending') throw promise
      if (status === 'error') throw result
      if (status === 'success') return result
      throw new Error('This should be impossible')
    },
  }
}

function PokemonForm({initialPokemonName = '', onSubmit}) {
  const [pokemonName, setPokemonName] = React.useState(initialPokemonName)

  function handleChange(e) {
    setPokemonName(e.target.value)
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(pokemonName)
  }

  function handleSelect(newPokemonName) {
    setPokemonName(newPokemonName)
    onSubmit(newPokemonName)
  }

  return (
    <form onSubmit={handleSubmit} className="pokemon-form">
      <label htmlFor="pokemonName-input">Pokemon Name</label>
      <small>
        Try{' '}
        <button
          className="invisible-button"
          type="button"
          onClick={() => handleSelect('pikachu')}
        >
          "pikachu"
        </button>
        {', '}
        <button
          className="invisible-button"
          type="button"
          onClick={() => handleSelect('charizard')}
        >
          "charizard"
        </button>
        {', or '}
        <button
          className="invisible-button"
          type="button"
          onClick={() => handleSelect('mew')}
        >
          "mew"
        </button>
      </small>
      <div>
        <input
          id="pokemonName-input"
          name="pokemonName"
          value={pokemonName}
          onChange={handleChange}
        />
        <button type="submit" disabled={!pokemonName.length}>
          Submit
        </button>
      </div>
    </form>
  )
}

export {
  ErrorBoundary,
  PokemonInfoFallback,
  createResource,
  PokemonForm,
  PokemonDataView,
}
