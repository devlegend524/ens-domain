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
        const quantities = services.cart.selectors.quantities(state);

        if (names.length > services.environment.MAX_REGISTRATION_NAMES) {
          names = names.slice(0, services.environment.MAX_REGISTRATION_NAMES);
        }

        let j = 0;
        const numSteps = names.length * 2;

        let _quantities = [];
        let lengths = [];

        for (let i = 0; i < names.length; i += 1) {
          let name = names[i];
          const nameArr = name.split(".");
          let actualName = "";
          for (let i = 0; i < nameArr.length - 1; i += 1) {
            actualName += nameArr[i];
            if (i < nameArr.length - 2) actualName += ".";
          }
          lengths.push(actualName.length);
          _quantities.push(quantities[name]);
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
        await api.registerWithPreimage(names, _quantities, lengths, preimages);

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
