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


  render() {
    if (this.props.hasError) return this.renderHasError();
    if (!this.props.isComplete) return this.renderProofs();
    return this.renderComplete();
  }
}

const mapStateToProps = (state) => ({
  names: services.cart.selectors.names(state),
  quantities: services.cart.selectors.quantities(state),


});

const mapDispatchToProps = (dispatch) => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationFlow);
