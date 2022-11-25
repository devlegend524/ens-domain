import React from "react";
import { connect } from "react-redux";

import services from "services";
import components from "components";

class ConnectWallet extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      connecting: false,
      privacy: false,
      terms: false,
    };
  }

  reset() {
    this.setState({
      connecting: false,
    });
  }

  async connectMetamask(providerFunc) {
    console.log("adsf")
    console.log(providerFunc)
    const func = async () => {
      this.setState(
        {
          connecting: true,
        },
        async () => {
          try {
            await services.provider.connectMetamask(providerFunc);
          } catch (err) {
            alert("Failed to connect");
            this.setState({
              connecting: false,
            });
          }
        }
      );
    };

    await func();
  }

  async connectCore() {
    this.setState(
      {
        connecting: true,
      },
      async () => {
        try {
          await services.provider.connectCore();
        } catch (err) {
          alert("Failed to connect");
          this.setState({
            connecting: false,
          });
        }
      }
    );
  }

  async walletConnect() {
    this.setState(
      {
        connecting: true,
      },
      async () => {
        try {
          await services.provider.connectWalletConnect();
        } catch (err) {
          if (err === "WRONG_CHAIN") {
            alert(
              `Wrong EVM chain. Please connect to ${services.environment.DEFAULT_CHAIN_NAME}.`
            );
          } else {
            alert("Failed to connect");
          }
          this.setState({
            connecting: false,
          });
        }
      }
    );
  }

  toggleDisclaimer(stateKey) {
    this.setState((currState) => {
      return {
        [stateKey]: !currState[stateKey],
      };
    });
  }

  renderDisclaimers() {
    return (
      <>
        <div className="">
          <p>
            By checking the boxes below, you acknowledge that you have read and
            agree to our{" "}
            <a
              className="text-alert-blue"
              href="https://wens.domains/p/privacy-policy"
              target="_blank"
            >
              Privacy Policy
            </a>{" "}
            and our{" "}
            <a
              className="text-alert-blue"
              href="https://wens.domains/p/terms-of-service"
              target="_blank"
            >
              Terms of Service
            </a>
            .
          </p>
          <p className="mt-2">
            You also acknowledge that{" "}
            <a
              className="text-alert-blue"
              target="_blank"
              href="https://wens.domains/blog/name-squatting-dispute-resolution/"
            >
              WENS Domains supports name disputes
            </a>
            .
          </p>
        </div>
        <div className="mt-4">
          <components.checkbox.Checkbox
            text={"I have read and agree to the Privacy Policy"}
            singleLine={true}
            checked={this.state.privacy}
            onCheck={() => this.toggleDisclaimer("privacy")}
          />
        </div>
        <div className="mt-2">
          <components.checkbox.Checkbox
            text={"I have read and agree to the Terms of Service"}
            singleLine={true}
            checked={this.state.terms}
            onCheck={() => this.toggleDisclaimer("terms")}
          />
        </div>
        <div className="mt-2">
          <components.checkbox.Checkbox
            text={"I understand that WENS supports name disputes"}
            singleLine={true}
            checked={this.state.disputes}
            onCheck={() => this.toggleDisclaimer("disputes")}
          />
        </div>
        <div className="mt-4 max-w-sm m-auto">
          <components.buttons.CustomButton
            variant="gradient"
            ripple={true}
            color="blue-gray"
            disabled={
              !this.state.terms || !this.state.privacy || !this.state.disputes
            }
            text={"Continue"}
            onClick={() => this.props.acceptDisclaimers()}
          />
        </div>
      </>
    );
  }

  renderStaticImage(path, alt) {
    const src = services.linking.static(path);
    return <img src={src} alt={alt} className="w-full" />;
  }

  render() {
    const wallets = [
      {
        name: "MetaMask",
        description:
          "Connect using a browser plugin. Best supported on Chrome or Firefox.",
        logo: this.renderStaticImage("images/vendor/metamask.png", "MetaMask"),
        connect: () => {
          this.connectMetamask.bind(this)((provider) => provider.isMetaMask);
        },
        class: "h-14 w-14",
      },
      {
        name: "Coinbase Wallet",
        description:
          "Connect using a self-custody wallet that gives you complete control of your crypto",
        logo: this.renderStaticImage(
          "images/vendor/coinbase.png",
          "Coinbase Wallet"
        ),
        connect: () => {
          this.connectCore.bind(this)((provider) => provider.isCoinbaseWallet);
        },
        class: "h-14 w-14",
      },
      {
        name: "WalletConnect",
        description:
          "Connect by scanning a QR code with any supported mobile wallet, like Rainbow.",
        logo: this.renderStaticImage(
          "images/vendor/walletconnect.png",
          "WalletConnect"
        ),
        connect: this.walletConnect.bind(this),
        class: "h-14 w-14",
      },
    ];
    // if (!this.props.hasAcceptedDisclaimers) return this.renderDisclaimers()

    return (
      <>
        {this.state.connecting ? (
          <div>
            <div className="my-8">
              <components.labels.Information text={"Connecting to wallet"} />
            </div>
            <div className="max-w-sm m-auto">
              <components.buttons.CustomButton
                variant="gradient"
                ripple={true}
                color="blue-gray"
                text="Cancel connection"
                onClick={this.reset.bind(this)}
              />
            </div>
          </div>
        ) : (
          <div className="relative grid grid-cols-1 md:grid-cols-1 gap-4 mt-4 max-w-md p-4 mx-auto rounded-lg bg-gray-100  border border-gray-200">
            <div className="text-center font-bold text-2xl mx-4">
              Connect Wallet
            </div>
            {wallets.map((wal, index) => (
              <div
                key={index}
                onClick={wal.connect}
                className={`cursor-pointer flex flex-row items-center rounded-xl hover:bg-gray-100 border border-gray-200 m-auto bg-white dark:bg-gray-800 w-full p-2 ${
                  this.state.connecting ? "blur" : ""
                }`}
              >
                <div
                  className={`${wal.class} flex justify-center items-center m-4`}
                >
                  {wal.logo}
                </div>
                <div className="mt-2">
                  <div className="text-lg font-semibold text-gray-800">
                    {wal.name}
                  </div>
                  <div className="text-sm text-gray-700">{wal.description}</div>
                </div>
                <div className="flex-none">
                  <img
                    src={services.linking.static("images/right.svg")}
                    alt="arrow"
                    className="w-5 h-5"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  injectSentry: services.user.selectors.injectSentry(state),
  hasAcceptedDisclaimers: services.user.selectors.hasAcceptedDisclaimers(state),
});

const mapDispatchToProps = (dispatch) => ({
  acceptDisclaimers: () => dispatch(services.user.actions.acceptDisclaimers()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ConnectWallet);
