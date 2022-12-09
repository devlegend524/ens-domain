import React from "react";
import { connect } from "react-redux";

import actions from "./actions";
import selectors from "./selectors";

import components from "components";
import services from "services";

class SetResolver extends React.PureComponent {
  constructor(props) {
    super(props);
    this.setWalletAddress();
    this.state = {
      walletAddress: null,
    };
  }

  setWalletAddress = async () => {
    const api = await services.provider.buildAPI();
    this.setState({
      walletAddress: api.account,
    });
  };

  submit = async () => {
    this.props.setEVMReverseRecord(this.props.domain);
  };

  render() {
    if (this.props.complete)
      return (
        <>
          <div className="max-w-md m-auto">
            <components.labels.Success text={"Primary has been set"} />
          </div>
          <div className="max-w-md m-auto mt-4">
            <components.buttons.CustomButton
              variant="gradient"
              ripple={true}
              color="blue-gray"
              text={"Close"}
              onClick={() => {
                this.props.reset();
                this.props.onComplete();
              }}
            />
          </div>
        </>
      );

    return (
      <>
        <div className="max-w-md m-auto">
          <div className="mb-2">
            {
              "Applications can then find your .eth name if they know your wallet address."
            }
          </div>
          <div className="mt-8">
            <components.buttons.CustomButton
              variant="gradient"
              ripple={true}
              color="blue-gray"
              sm={true}
              text={"Set as Primary"}
              onClick={() => this.submit()}
              loading={this.props.loading}
            />
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  loading: selectors.isSettingEVMReverseRecord(state),
  complete: selectors.isSettingEVMReverseRecordComplete(state),
});

const mapDispatchToProps = (dispatch) => ({
  setEVMReverseRecord: (domain) =>
    dispatch(actions.setEVMReverseRecord(domain)),
  reset: () => dispatch(actions.resetSetEVMReverseRecord()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SetResolver);
