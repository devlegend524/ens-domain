import services from "services";

import constants from "./constants";
import selectors from "./selectors";

const actions = {
  setHash: hash => {
    return {
      type: constants.SET_HASH,
      hash
    };
  },

  setProgress: progress => {
    return {
      type: constants.SET_PROGRESS,
      progress
    };
  },

  setIsFinalizing: value => {
    return {
      type: constants.SET_IS_FINALIZING,
      value
    };
  },

  setHasError: value => {
    return {
      type: constants.SET_HAS_ERROR,
      value
    };
  },

  setIsComplete: value => {
    return {
      type: constants.SET_IS_COMPLETE,
      value
    };
  },

  reset: () => {
    return (dispatch, getState) => {
      dispatch(actions.setIsComplete(false));
      dispatch(actions.setIsFinalizing(false));
      dispatch(actions.setProgress(0));
    };
  },

  setRegistrationPremium: premium => {
    return {
      type: constants.SET_REGISTRATION_PREMIUM,
      premium
    };
  },

  setBalance: balance => {
    return {
      type: constants.SET_BALANCE,
      balance
    };
  },

  loadBalance: () => {
    return async (dispatch, getState) => {
      const api = services.provider.buildAPI();
      const balance = await api.getBalance();
      dispatch(actions.setBalance(balance));
    };
  },

  registerDomain: names => {
    return async (dispatch, getState) => {
      try {
        dispatch(actions.setIsFinalizing(true));
        const api = services.provider.buildAPI();
        const state = getState();
        const constraintsProofs = services.proofs.selectors.constraintsProofs(
          state
        );
        const pricingProofs = services.proofs.selectors.pricingProofs(state);
        const quantities = services.cart.selectors.quantities(state);

        if (names.length > services.environment.MAX_REGISTRATION_NAMES) {
          names = names.slice(0, services.environment.MAX_REGISTRATION_NAMES);
        }

        let j = 0;
        const numSteps = names.length * 2 + 1;

        let _quantities = [];
        let _pricingProofs = [];
        let _constraintsProofs = [];

        for (let i = 0; i < names.length; i += 1) {
          let name = names[i];
          console.log("quantities: ", quantities[name]);
          _quantities.push(quantities[name]);
          if (!pricingProofs[name]) {
            dispatch(
              actions.setProgress({
                message: `Checking price for ${name} (${j + 1}/${numSteps})`,
                percent: parseInt(j / numSteps * 100)
              })
            );
            let pricingRes = await api.generateDomainPriceProof(name);
            dispatch(
              services.proofs.actions.setPricingProof(name, pricingRes.calldata)
            );
            _pricingProofs.push(pricingRes.calldata);
          } else {
            _pricingProofs.push(pricingProofs[name]);
          }
          j += 1;
          if (!constraintsProofs[name]) {
            dispatch(
              actions.setProgress({
                message: `Checking constraints for ${name} (${j +
                  1}/${numSteps})`,
                percent: parseInt(j / numSteps * 100)
              })
            );
            let constraintsRes = await api.generateConstraintsProof(name);
            dispatch(
              services.proofs.actions.setConstraintsProof(
                name,
                constraintsRes.calldata
              )
            );
            _constraintsProofs.push(constraintsRes.calldata);
          } else {
            _constraintsProofs.push(constraintsProofs[name]);
          }
          j += 1;
        }
        dispatch(
          actions.setProgress({
            message: `Registering Domain (${j + 1}/${numSteps})`,
            percent: parseInt(j / numSteps * 100)
          })
        );
        j += 1;

        const preimages = await api.buildPreimages(names);
        await api.registerWithPreimage(
          names,
          _quantities,
          _constraintsProofs,
          _pricingProofs,
          preimages
        );

        await api.generateNFTImage(names);

        dispatch(actions.setIsComplete(true));
        dispatch(actions.setIsFinalizing(false));
        dispatch(
          actions.setProgress({
            message: `Done`,
            percent: 100
          })
        );
      } catch (err) {
        console.log(err);
        dispatch(actions.setHasError(true));
        dispatch(actions.setIsFinalizing(false));
      }
    };
  }
};

export default actions;
