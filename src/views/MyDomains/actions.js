import constants from './constants'
import services from 'services'

const actions = {
  hasLoadedDomains: (loaded) => {
    return {
      type: constants.HAS_LOADED_DOMAINS,
      loaded
    }
  },

  loadDomains: () => {
    return async (dispatch, getState) => {
      dispatch(services.user.actions.loadDomains())
      dispatch(actions.hasLoadedDomains(true))
    }
  },
}

export default actions
