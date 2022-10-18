import constants from './constants'

export const reducerName = 'myDomainsView'

export const initialState = {
  hasLoadedDomains: false,
}

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case constants.HAS_LOADED_DOMAINS:
      return {
        ...state,
        hasLoadedDomains: action.loaded
      }

    default:
      return state
  }
}

const exports = {
  reducer, 
  reducerName,
  initialState,
}

export default exports
