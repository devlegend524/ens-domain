import reduxService from 'services/redux'

const constants = reduxService.prepareConstants(
  'views/MyDomains',
  [
    'HAS_LOADED_DOMAINS', 
  ]
)

export default constants
