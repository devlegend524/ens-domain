import React from "react";
import { connect } from "react-redux";
import { Button } from "@material-tailwind/react";

import components from "components";
import services from "services";

import actions from "./actions";
import selectors from "./selectors";

class RegistrationFlow extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      connected: services.provider.isConnected(),
      needsProofs: true,
      hasProofs: false,
    };
  }

  reset() {
    this.setState({
      needProofs: true,
      hasProofs: false,
    });
  }

  generateProofs() {
    this.setState(
      {
        needsProofs: false,
      },
      () => {
        this.props.generateProofs(this.props.names);
      }
    );
  }

  finalizeTransaction() {
    this.props.finalizeTransaction();
  }

  viewDomain() {
    this.props.clear();
    location.href = services.linking.path("MyDomains");
  }

  onConnect() {
    setTimeout(() => {
      this.setState({
        connected: services.provider.isConnected(),
        needsProofs: true,
      });
    }, 1);
  }

  componentDidMount() {
    services.provider.addEventListener(
      services.provider.EVENTS.CONNECTED,
      this.onConnect.bind(this)
    );
  }

  componentWillUnmount() {
    services.provider.addEventListener(
      services.provider.EVENTS.CONNECTED,
      this.onConnect.bind(this)
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.names.length !== prevProps.names.length) {
      this.setState({
        needsProofs: true,
      });
    }
  }

  renderConnect() {
    return (
      <>
        <div className="font-bold border-b border-gray-400 pb-4 mb-4">
          {"Connect Wallet"}
        </div>
        <components.ConnectWallet />
      </>
    );
  }

  renderProofs() {
    return (
      <>
        <div className="font-bold border-b border-gray-400 pb-4 mb-5">
          {"Step 2:  Generate Proofs"}
        </div>
        <components.labels.Information
          text={
            "Generating proofs can take up to 5 minutes. please wait until its completed."
          }
        />
        {this.state.needsProofs ? (
          <div className="mt-8 max-w-sm m-auto flex justify-center">
            <Button
              variant="filled"
              ripple={true}
              color="blue-gray"
              onClick={this.generateProofs.bind(this)}
              disabled={!this.props.startPurchase}
            >
              {"Generate proofs"}
            </Button>
          </div>
        ) : (
          <>
            <div className="my-8 py-4 rounded">
              <div className="mb-4 text-center text-gray-400 flex items-center justify-center">
                {this.props.progress.message}
              </div>
              <div className="max-w-sm m-auto">
                <components.ProgressBar
                  progress={this.props.progress.percent}
                />
              </div>
            </div>
            <div className="mt-4 max-w-sm m-auto flex justify-center">
              <Button
                variant="gradient"
                ripple={true}
                color="blue"
                onClick={() => this.setState({ hasProofs: true })}
                disabled={this.props.progress.percent < 100}
              >
                {"Continue"}
              </Button>
            </div>
          </>
        )}
        <>
          <div className="font-bold border-b border-gray-400 pb-4 mb-4 mt-8">
            {"Step 3:  Complete Registration"}
          </div>
          <div className="mt-8 max-w-sm m-auto flex justify-center items-center">
            <div className="mt-4">
              <Button
                variant="gradient"
                ripple={true}
                color="green"
                disabled={!this.state.hasProofs}
                onClick={this.finalizeTransaction.bind(this)}
              >
                <div className=" flex justify-center items-center">
                  {this.props.isFinalizing ? (
                    <components.Spinner size="xs" color={"#eee"} />
                  ) : (
                    ""
                  )}{" "}
                  Finalize registration
                </div>
              </Button>
            </div>
          </div>
        </>
      </>
    );
  }

  renderComplete() {
    return (
      <>
        <div className="font-bold border-b border-gray-400 pb-4 mb-4 mt-5">
          {"Registration Complete"}
        </div>
        <>
          <components.labels.Success
            text={"Your registration was successful."}
          />
          <div className="mt-8 max-w-sm m-auto flex justify-center">
            <div className="mt-4">
              <Button
                variant="gradient"
                ripple={true}
                color="blue"
                onClick={this.viewDomain.bind(this)}
              >
                {"View my domains"}
              </Button>
            </div>
          </div>
        </>
      </>
    );
  }

  renderHasError() {
    return (
      <>
        <div className="font-bold border-b border-gray-400 pb-4 mb-4">
          {"Error"}
        </div>
        <components.labels.Error
          text={
            "We've encountered an error with your registration. Please reload the page and try again."
          }
        />
        <div className="mt-8 max-w-sm m-auto">
          <Button
            variant="gradient"
            ripple={true}
            color="gray"
            onClick={() => window.location.reload()}
          >
            {"Reload page"}
          </Button>
        </div>
      </>
    );
  }

  render() {
    if (this.props.hasError) return this.renderHasError();
    if (!this.props.isComplete) return this.renderProofs();
    return this.renderComplete();
  }
}

const mapStateToProps = (state) => ({
  progress: selectors.progress(state),
  names: services.cart.selectors.names(state),
  quantities: services.cart.selectors.quantities(state),
  pricingProofs: services.proofs.selectors.pricingProofs(state),
  constraintsProofs: services.proofs.selectors.constraintsProofs(state),
  hasCommit: selectors.hasCommit(state),
  hasError: selectors.hasError(state),
  isComplete: selectors.isComplete(state),
  isCommitting: selectors.isCommitting(state),
  isFinalizing: selectors.isFinalizing(state),
});

const mapDispatchToProps = (dispatch) => ({
  generateProofs: (names) => dispatch(actions.generateProofs(names)),
  finalizeTransaction: () => dispatch(actions.finalize()),
  nextBatch: () => dispatch(actions.reset()),
  clear: () => dispatch(services.cart.actions.clear()),
});

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationFlow);
