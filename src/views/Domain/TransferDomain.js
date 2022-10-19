import React from "react";
import { connect } from "react-redux";

import actions from "./actions";
import selectors from "./selectors";

import components from "components";

class TransferDomain extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      newOwner: "",
    };
  }

  submit = async () => {
    this.props.transferDomain(this.props.domain, this.state.newOwner);
  };

  render() {
    if (this.props.complete)
      return (
        <>
          <div className="max-w-md m-auto">
            <components.labels.Success text={"Domain has been transferred"} />
          </div>
          <div className="max-w-md m-auto mt-4">
            <components.buttons.CustomButton
              variant="gradient"
              ripple={true}
              color="blue-gray"
              text={"Close"}
              onClick={() => this.props.onComplete()}
            />
          </div>
        </>
      );

    return (
      <>
        <div className="max-w-md m-auto">

          <div className="font-bold mb-2 mt-4">New Owner Address</div>
          <components.Input
            value={this.state.newOwner}
            type="text"
            placeholder="0x600bE5FcB9338BC3938e4***"
            onChange={(e) =>
              this.setState({
                newOwner: e.target.value,
              })
            }
          />
          {this.props.error ? (
            <div className="mt-8">
              <components.labels.Error text={this.props.error} />
            </div>
          ) : null}
          <div className="mt-8">
            <components.buttons.CustomButton
              variant="gradient"
              ripple={true}
              color="blue-gray"
              fullWidth={true}
              sm={true}
              text={"Submit"}
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
  loading: selectors.isTransferringDomain(state),
  complete: selectors.transferDomainSuccess(state),
  error: selectors.transferDomainError(state),
});

const mapDispatchToProps = (dispatch) => ({
  transferDomain: (domain, address) =>
    dispatch(actions.transferDomain(domain, address)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TransferDomain);
