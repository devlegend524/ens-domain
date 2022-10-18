import { reducerName } from './reducer'

const root = (state) => state[reducerName]

const selectors = {
  hasLoadedDomains: (state) => root(state).hasLoadedDomains,
}

export default selectors
