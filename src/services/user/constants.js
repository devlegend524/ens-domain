import reduxService from 'services/redux'

const constants = reduxService.prepareConstants(
  'services/user',
  [
    'SET_DOMAIN_IDS',
    'SET_DOMAIN_COUNT',
    'SET_LOADED_DOMAIN_COUNT',
    'SET_DOMAIN_EXPIRY',

    'SET_TOKEN', 

    'ACCEPT_DISCLAIMERS',

    'SET_WALLET_AUTOCONNECT',
  ]
)

export default constants
