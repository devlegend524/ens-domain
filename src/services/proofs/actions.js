import constants from './constants'

const actions = {
  setPricingProof: (domain, proof) => {
    return {
      type: constants.SET_PRICING_PROOF,
      domain,
      proof
    }
  },

  setConstraintsProof: (domain, proof) => {
    return {
      type: constants.SET_CONSTRAINTS_PROOF,
      domain,
      proof
    }
  },
}

export default actions
