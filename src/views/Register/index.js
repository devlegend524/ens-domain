import React from "react";
import { connect } from "react-redux";
import { Button } from "@material-tailwind/react";
import services from "services";
import components from "components";

import actions from "./actions";
import constants from "./constants";
import reducer from "./reducer";
import selectors from "./selectors";

class Register extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      paginationIndex: 0,
      connected: services.provider.isConnected(),
      importingRegistrations: false,
      startPurchase: false,
      needsProofs: true,
      hasProofs: false,
    };
  }

  componentDidMount() {
    services.linking.addEventListener("Domain", this.updateParams);
    services.provider.addEventListener(
      services.provider.EVENTS.CONNECTED,
      this.onConnect.bind(this)
    );
    services.provider.addEventListener(
      services.provider.EVENTS.DISCONNECTED,
      this.onDisconnect.bind(this)
    );
    if (services.provider.isConnected()) {
      this.props.loadBalance();
    }
  }

  componentWillUnmount() {
    services.linking.removeEventListener("Domain", this.updateParams);
    services.provider.addEventListener(
      services.provider.EVENTS.CONNECTED,
      this.onConnect.bind(this)
    );
    services.provider.addEventListener(
      services.provider.EVENTS.DISCONNECTED,
      this.onDisconnect.bind(this)
    );
  }

  onConnect() {
    this.props.loadBalance();
    if (this.connectModal) {
      this.connectModal.hide();
    }
    this.setState({
      connected: true,
    });
    this.props.refreshNameData();
  }

  onDisconnect() {
    this.setState({
      connected: false,
    });
  }

  registerDomain() {}

  viewDomain() {
    this.props.clear();
    location.href = services.linking.path("MyDomains");
  }

  removeFromCart(name) {
    this.props.removeFromCart(name);
  }

  cancelRegistration = () => {
    if (window.confirm("Are you sure?")) {
      this.props.clear();
    }
  };

  removeUnavailable() {
    this.props.names.forEach((name) => {
      const nameData = this.props.nameData[name];
      const validStatuses = [
        nameData.constants.DOMAIN_STATUSES.AVAILABLE,
        nameData.constants.DOMAIN_STATUSES.REGISTERED_SELF,
      ];
      if (validStatuses.indexOf(nameData.status) === -1) {
        this.props.removeFromCart(name);
      }
    });
  }

  startPurchase() {
    this.props.resetRegistration();

    this.setState(
      {
        needsProofs: false,
        startPurchase: true,
      },
      () => {
        this.props.registerDomain(this.props.names);
      }
    );
  }

  renderNotAvailable(name, status) {
    return (
      <div className="bg-gray-100 rounded-lg mb-4 p-4">
        {name} {"is not available for registration"}
      </div>
    );
  }

  renderName(name, index) {
    const nameData = this.props.nameData[name];
    if (!nameData) return null;
    if (
      nameData.status !== nameData.constants.DOMAIN_STATUSES.AVAILABLE &&
      nameData.status !== nameData.constants.DOMAIN_STATUSES.REGISTERED_SELF
    )
      return null;

    return (
      <div key={index} className="rounded-lg mb-4 p-4 w-full">
        <div className="flex justify-between flex-col items-center sm:flex-row">
          <div className="text-center sm:text-left">
            <div className="font-bold sm:text-xl">{name}</div>
          </div>
          <div className="ml-2 cursor-pointer bg-gray-200 dark:bg-gray-700 px-2 md:px-4 py-2 rounded-lg flex items-center justify-center text-sm">
            <div
              className="cursor-pointer"
              onClick={() => this.removeFromCart(name)}
            >
              Remove
            </div>
          </div>
        </div>
        <div className="mx-auto flex justify-center mt-5 bg-gray-100 p-2">
          <components.NFTCard name={name} classes="animated_border" />
        </div>
      </div>
    );
  }

  renderNames() {
    if (!this.props.balance) return null;

    let names = Array.from(this.props.names).sort((a, b) => (a > b ? 1 : -1));
    const nameData = this.props.nameData;
    const quantities = this.props.quantities;
    for (let i = 0; i < names.length; i += 1) {
      if (!nameData[names[i]] || !quantities[names[i]]) {
        console.log("missing namedata");
        console.log(names[i]);
        return null;
      }
    }
    if (names.length === 0) return null;
    const unavailable = [];
    const total = names.reduce(
      (sum, curr) => {
        if (
          nameData[curr].status !==
            nameData[curr].constants.DOMAIN_STATUSES.AVAILABLE &&
          nameData[curr].status !==
            nameData[curr].constants.DOMAIN_STATUSES.REGISTERED_SELF
        ) {
          unavailable.push(curr);
          return sum;
        }
        if (
          nameData[curr].status ===
          nameData[curr].constants.DOMAIN_STATUSES.REGISTERED_SELF
        ) {
          hasRenewal = true;
        }
        const namePrice = nameData[curr].priceUSDCents;
        const namePriceWeth = nameData[curr].priceWETHEstimate;
        if (!namePrice || !namePriceWeth)
          return {
            usd: "0",
            weth: "0",
          };
        const quantity = quantities[curr];
        console.log(namePrice);
        console.log(namePriceWeth);
        console.log(quantity);

        const registrationPrice = services.money.mul(namePrice, quantity);
        const registrationPriceWeth = services.money.mul(
          namePriceWeth,
          quantity
        );
        return {
          usd: services.money.add(sum.usd, registrationPrice),
          weth: services.money.add(sum.weth, registrationPriceWeth),
        };
      },
      { usd: "0", weth: "0" }
    );
    if (unavailable.length > 0)
      return (
        <div className="mb-4">
          <components.labels.Error
            text={`${unavailable.join(", ")} ${
              unavailable.length === 1 ? "is" : "are"
            }  no longer available for registration.`}
          />
          <div className="mt-8 max-w-sm m-auto">
            <components.buttons.CustomButton
              variant="gradient"
              ripple={true}
              color="blue-gray"
              text={"Continue"}
              onClick={() => this.removeUnavailable()}
            />
          </div>
        </div>
      );

    if (!this.props.isComplete)
      return (
        <>
          <div className="w-full m-auto">
            <div className="m-auto mb-8">
              <div className="border-b border-gray-400 pb-4 mb-4">
                <div className="text-lg font-bold">{"Purchase Summary"}</div>
              </div>
              <div className="flex flex-col justify-center items-center">
                <div className="max-w-sm w-full mt-5">
                  <div className="flex justify-between mb-4">
                    <div className="font-bold">{"Price in USD"}</div>
                    <div className="text-red-500">
                      {services.money.renderUSD(total.usd)}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="font-bold">{"Total (ETH)"}</div>
                    <div className="text-blue-500">
                      {services.money.renderWETH(total.weth)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {this.props.balance.lt(total.weth) ? (
              <div className="mb-8">
                <components.labels.Error
                  text={
                    "Your connected wallet does not have enough funds to continue the registration."
                  }
                />
              </div>
            ) : null}
            <div className="flex flex-row justify-center items-center gap-5">
              <div
                className={`${this.props.isFinalizing ? "" : "border-info"}`}
              >
                <Button
                  variant="gradient"
                  ripple={true}
                  color="blue-gray"
                  onClick={this.startPurchase.bind(this)}
                  disabled={this.props.balance.lt(total.weth)}
                >
                  <div className="flex justify-center items-center">
                    {this.props.isFinalizing ? (
                      <div className="flex items-center">
                        <components.Spinner size="sm" />
                        <components.labels.Information
                          text={this.props.progress.message}
                        />
                      </div>
                    ) : (
                      "Confirm Registration"
                    )}
                  </div>
                </Button>
              </div>

              <Button
                className="cursor-pointer"
                variant="gradient"
                ripple={true}
                color="blue-gray"
                onClick={() => this.cancelRegistration()}
                disabled={this.props.isFinalizing}
              >
                {"Cancel registration"}
              </Button>
            </div>
          </div>
        </>
      );
  }

  renderComplete() {
    return (
      <>
        <div className="font-bold border-b border-gray-400 pb-4 mb-4 mt-5">
          {"Registration Complete"}
        </div>
        <div>
          <div className="flex flex-col justify-center items-center">
            <img
              src={services.linking.static("images/success.svg")}
              alt="Success"
              srcSet=""
              className="w-[100px] h-[100px]"
            />
            <div className="py-4">
              <components.labels.Success
                text={"Your registration was successful."}
              />
            </div>
          </div>

          <div className="mt-8 max-w-md m-auto flex justify-center">
            <div className="mt-4 w-full border-warning">
              <Button
                variant="gradient"
                ripple={true}
                color="blue-gray"
                fullWidth={true}
                onClick={this.viewDomain.bind(this)}
              >
                {"View my domains"}
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  renderHasError() {
    return (
      <>
        <div className="font-bold border-b border-gray-400 pb-4 mb-4">
          {"Error"}
        </div>
        <div className="flex flex-col justify-center items-center">
          <img
            src={services.linking.static("images/failed.svg")}
            alt="Failed"
            srcSet=""
            className="w-[100px] h-[100px]"
          />
          <div className="py-4">
            <components.labels.Error
              text={"Failed to register domain."}
              classes="py-4"
            />
          </div>
        </div>

        <div className="mt-8 max-w-sm m-auto border-warning">
          <components.buttons.CustomButton
            variant="gradient"
            ripple={true}
            color="blue-gray"
            text={"Reload page"}
            onClick={() => window.location.reload()}
          />
        </div>
      </>
    );
  }

  renderBody() {
    if (!this.props.balance) return null;

    let names = Array.from(this.props.names).sort((a, b) => (a > b ? 1 : -1));

    if (
      (!this.props.names || this.props.names.length === 0) &&
      !this.props.isComplete
    )
      return (
        <div className="max-w-md m-auto">
          <div className="flex justify-center mt-2 md:mt-8 mb-4 items-center">
            <div className="text-lg font-bold pl-2 py-4">
              {"Register New Domain"}
            </div>
          </div>
          <div className="mb-8 flex justify-center">
            <div className="relative animated_border">
              <img
                src={services.linking.static("images/nft_bg.png")}
                className="rounded-lg"
                alt="NFT PIC"
                srcSet=""
              />
            </div>
          </div>
          <components.DomainSearch />
        </div>
      );
    if (this.props.isRefreshingNameData)
      return (
        <div className="mt-8 max-w-sm m-auto text-center">
          <div className="flex justify-center mt-2 md:mt-8 mb-4 items-center">
            <div className="text-lg font-bold pl-2">
              {"Register New Domain"}
            </div>
          </div>
          <components.ProgressBar
            progress={this.props.refreshNameDataProgress}
          />
          <div className="mt-4 text-gray-400 dark:text-gray-700">
            {"Loading registration data"}
          </div>
        </div>
      );

    return (
      <>
        <div className="text-lg font-bold pl-2 mt-8 border-b border-gray-400 pb-4">
          {"Register New Domain"}
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-col mt-2 md:mt-8 p-3 w-full max-w-sm  flex-none custom-border ">
            {names.map(this.renderName.bind(this))}
          </div>
          <div className=" mt-8 w-full p-3">
            {!this.props.isComplete && !this.props.hasError
              ? this.renderNames()
              : ""}
            {this.props.isComplete && this.renderComplete()}
            {this.props.hasError && this.renderHasError()}
          </div>
        </div>
      </>
    );
  }

  render() {
    return <div>{this.renderBody()}</div>;
  }
}

const mapStateToProps = (state) => ({
  names: services.cart.selectors.names(state),
  nameData: services.cart.selectors.nameData(state),
  quantities: services.cart.selectors.quantities(state),
  isRefreshingNameData: services.cart.selectors.isRefreshingNameData(state),
  isDarkmode: services.darkmode.selectors.isDarkmode(state),
  bulkRegistrationProgress: services.cart.selectors.bulkRegistrationProgress(
    state
  ),
  refreshNameDataProgress: services.cart.selectors.refreshNameDataProgress(
    state
  ),
  balance: selectors.balance(state),
  pricingProofs: services.proofs.selectors.pricingProofs(state),
  constraintsProofs: services.proofs.selectors.constraintsProofs(state),
  hasCommit: selectors.hasCommit(state),
  hasError: selectors.hasError(state),
  isComplete: selectors.isComplete(state),
  isCommitting: selectors.isCommitting(state),
  isFinalizing: selectors.isFinalizing(state),
  progress: selectors.progress(state),
});

const mapDispatchToProps = (dispatch) => ({
  loadBalance: () => dispatch(actions.loadBalance()),
  removeFromCart: (name) =>
    dispatch(services.cart.actions.removeFromCart(name)),
  refreshNameData: () => dispatch(services.cart.actions.refreshAllNameData()),
  resetRegistration: () => dispatch(actions.reset()),
  registerDomain: (names) => dispatch(actions.registerDomain(names)),
  nextBatch: () => dispatch(actions.reset()),
  clear: () => dispatch(services.cart.actions.clear()),
});

const component = connect(mapStateToProps, mapDispatchToProps)(Register);

component.redux = {
  actions,
  constants,
  reducer,
  selectors,
};

export default component;
