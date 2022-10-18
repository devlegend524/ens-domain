import { reducerName } from './reducer'

const root = (state) => state[reducerName]

const selectors = {
  domainIds: (state) => root(state).domainIds,
  domainCount: (state) => root(state).domainCount,
  loadedDomainCount: (state) => root(state).loadedDomainCount,
  token: (state) => root(state).token,
  expiries: (state) => root(state).expiries,

  injectSentry: (state) => root(state).injectSentry,
  hasAcceptedDisclaimers: (state) => root(state).hasAcceptedDisclaimers,

  walletAutoconnect: (state) => root(state).walletAutoconnect
}

export default selectors
