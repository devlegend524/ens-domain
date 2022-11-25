//
// This service handles the connection
// with the web3 provider
//

import API from "services/api";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import detectEthereumProvider from "@metamask/detect-provider";
import SafeAppsSDK from "@gnosis.pm/safe-apps-sdk";
import { SafeAppProvider } from "@gnosis.pm/safe-apps-provider";

import services from "services";

let store;

let _isConnected = false;
let _chainId;
let _account;
let _provider;
let _signer;
let _providerType; // METAMASK or WALLETCONNECT

const CONNECTION_TYPES = {
  METAMASK: 1,
  WALLETCONNECT: 2,
  CORE: 3
};

const PROVIDER_TYPES = {
  METAMASK: 1,
  WALLETCONNECT: 2
};

const events = new EventTarget();

const EVENTS = {
  CONNECTED: 1,
  DISCONNECTED: 2
};

const setWalletAutoconnect = async wallet => {
  store.store.dispatch(services.user.actions.setWalletAutoconnect(wallet));
};

const provider = {
  // whether we have a web3 connection or not
  isConnected: () => _isConnected,

  EVENTS,
  PROVIDER_TYPES,

  providerType: () => {
    return _providerType;
  },

  initGnosisSafe: async () => {
    const opts = {
      allowedDomains: [/gnosis-safe.io/]
    };
    const sdk = new SafeAppsSDK(opts);
    const safe = await sdk.safe.getInfo();
    services.logger.info("Gnosis Safe is connected");
    const chainId = safe.chainId;
    if (chainId === parseInt(services.environment.DEFAULT_CHAIN_ID)) {
      services.logger.info("Chain ID is correct");
      const safeProvider = new SafeAppProvider(safe, sdk);
      _provider = new ethers.providers.Web3Provider(safeProvider);
      _signer = _provider.getSigner();
      _chainId = chainId;
      _account = safe.safeAddress;
      _isConnected = true;

      // we put a timeout here to let react
      // components digest the connection first
      setTimeout(() => {
        events.dispatchEvent(new Event(EVENTS.CONNECTED));
      }, 1);
    } else {
      services.logger.info("Incorrect Chain ID");
    }
  },

  autoconnect: async () => {
    const state = store.store.getState();
    const walletAutoconnect = services.user.selectors.walletAutoconnect(state);

    switch (walletAutoconnect) {
      case CONNECTION_TYPES.METAMASK:
        provider.connectMetamask();
        break;

      case CONNECTION_TYPES.WALLETCONNECT:
        provider.connectWalletConnect();
        break;

      default:
        return;
    }
  },

  init: _store => {
    store = _store;

    // this performs some checks when the application starts
    provider.initGnosisSafe();
    provider.autoconnect();
  },

  connectWalletConnect: () => {
    return new Promise(async (resolve, reject) => {
      _provider = new WalletConnectProvider({
        infuraId: "43a5d6ed07a140288e17955ddde82ae1"
      });
      await _provider.enable().catch(reject);
      const web3Provider = new ethers.providers.Web3Provider(_provider);
      _signer = web3Provider.getSigner();
      _providerType = PROVIDER_TYPES.WALLETCONNECT;

      const _getChainId = async () => {
        const id = await _provider.request({
          method: "eth_chainId"
        });
        return id;
      };

      const chainId = await _getChainId();
      const expectedChainId = parseInt(services.environment.DEFAULT_CHAIN_ID);
      if (chainId !== expectedChainId) {
        return reject("WRONG_CHAIN");
      } else {
        continueInitialization();
      }

      async function continueInitialization() {
        _chainId = await _getChainId();
        services.logger.info("Chain has changed");
        services.logger.info("Initializing accounts");

        _account = await _signer.getAddress();
        _isConnected = true;

        // we put a timeout here to let react
        // components digest the connection first
        setTimeout(() => {
          events.dispatchEvent(new Event(EVENTS.CONNECTED));
        }, 1);

        _provider.on("accountsChanged", () => {
          services.logger.info("Metamask accounts changed; reloading page");
          window.location.reload();
        });

        _provider.on("chainChanged", () => {
          services.logger.info("Metamask chain changed; reloading page");
          window.location.reload();
        });

        await setWalletAutoconnect(CONNECTION_TYPES.WALLETCONNECT);
        resolve();
      }
    });
  },

  disconnectWallet: async () => {
    if (_provider.disconnect) _provider.disconnect();

    _isConnected = false;
    _chainId = undefined;
    _account = undefined;
    _provider = undefined;
    _signer = undefined;
    _providerType = undefined;

    events.dispatchEvent(new Event(EVENTS.DISCONNECTED));

    await setWalletAutoconnect(null);
  },

  // connect to web3 via metamask
  connectMetamask: (providerFunc, connectionType) => {
    return new Promise(async (resolve, reject) => {
      let provider = await detectEthereumProvider();
      console.log(provider.providers)
      if (provider.providers) {
        provider = provider.providers.find(providerFunc);
      }

      if (!connectionType) connectionType = CONNECTION_TYPES.METAMASK;

      if (!provider) {
        services.logger.error("No window.ethereum provider");
        return reject("NO_PROVIDER");
      }

      const _getChainId = async () => {
        const raw = await provider.request({ method: "eth_chainId" });
        return parseInt(raw, 16);
      };

      // verify they connected to the right chain
      const chainId = await _getChainId();
      const expectedChainId = parseInt(services.environment.DEFAULT_CHAIN_ID);
      console.log("chainId:" + chainId)
      console.log("expectedChainId:" + expectedChainId)
      if (chainId !== expectedChainId) {
        try {
          services.logger.info("Attempting to switch chains");
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [
              {
                chainId: "0x" + expectedChainId.toString(16)
              }
            ]
          });
          continueInitialization();
        } catch (err) {
          services.logger.info("Chain not found");
          try {
            services.logger.info("Attempting to add chain");
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x" + expectedChainId.toString(16),
                  chainName: services.environment.DEFAULT_CHAIN_NAME,
                  nativeCurrency: {
                    name: "ETH",
                    symbol: "ETH",
                    decimals: 18
                  },
                  rpcUrls: [services.environment.DEFAULT_PROVIDER_URL],
                  blockExplorerUrls: [
                    services.environment.DEFAULT_BLOCK_EXPLORER_URL
                  ]
                }
              ]
            });
            continueInitialization();
          } catch (err) {
            services.logger.error(err);
            return reject("WRONG_CHAIN");
          }
        }
      } else {
        continueInitialization();
      }

      async function continueInitialization() {
        _chainId = await _getChainId();
        services.logger.info("Chain has changed");
        services.logger.info("Initializing accounts");
        const accounts = await provider.request({
          method: "eth_requestAccounts"
        });

        _account = accounts[0];
        _isConnected = true;
        _provider = new ethers.providers.Web3Provider(provider);
        _signer = _provider.getSigner();
        _providerType = PROVIDER_TYPES.METAMASK;

        // we put a timeout here to let react
        // components digest the connection first
        setTimeout(() => {
          events.dispatchEvent(new Event(EVENTS.CONNECTED));
        }, 1);

        window.ethereum.on("accountsChanged", () => {
          services.logger.info("Metamask accounts changed; reloading page");
          window.location.reload();
        });

        window.ethereum.on("chainChanged", () => {
          services.logger.info("Metamask chain changed; reloading page");
          window.location.reload();
        });

        await setWalletAutoconnect(connectionType);
        resolve();
      }
    });
  },

  connectCore: () => {
    return new Promise(async (resolve, reject) => {
      const handleChanged = () => {
        window.ethereum.off("accountsChanged", handleChanged);
        provider.connectMetamask(provider => provider.isEthereum);
        resolve();
      };
      window.ethereum.on("accountsChanged", handleChanged);
      provider.connectMetamask(
        provider => provider.isEthereum,
        CONNECTION_TYPES.CORE
      );
    });
  },

  // get the account
  getAccount: () => {
    return _account;
  },

  // get api client
  buildAPI: () => {
    if (_isConnected) {
      // _chainId set when we connect
      // _account set when we connect
      // _signer set when we connect
      return new API(_chainId, _account, _signer);
    } else {
      _chainId = parseInt(services.environment.DEFAULT_CHAIN_ID);
      _provider = new ethers.providers.JsonRpcProvider(
        services.environment.DEFAULT_PROVIDER_URL
      );
      //_signer = _provider.getSigner(ethers.Wallet.createRandom().address)
      return new API(_chainId, _account, _provider);
    }
  },

  // listen for changes
  addEventListener: (eventName, callback) => {
    events.addEventListener(eventName, callback);
  },

  // stop listening for changes
  removeEventListener: (eventName, callback) => {
    events.removeEventListener(eventName, callback);
  },

  signMessage: async message => {
    let sig;
    if (_providerType === PROVIDER_TYPES.METAMASK) {
      sig = await window.ethereum.request({
        method: "personal_sign",
        params: [message, _account]
      });
    } else if (_providerType === PROVIDER_TYPES.WALLETCONNECT) {
      //sig = await _signer.signMessage(message)
      sig = await new ethers.providers.Web3Provider(
        _provider
      ).send("personal_sign", [
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes(message)),
        _account.toLowerCase()
      ]);
    } else {
      throw new Error("Unknown provider type for signMessage");
    }
    return sig;
  }
};

export default provider;
