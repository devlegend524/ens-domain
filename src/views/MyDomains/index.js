import React from "react";
import { connect } from "react-redux";
import {
  RefreshIcon,
  SearchIcon,
  ArrowRightIcon,
} from "@heroicons/react/solid";
import { EyeOffIcon } from "@heroicons/react/outline";
import { Link } from "react-router-dom";

import components from "components";
import services from "services";

import actions from "./actions";
import constants from "./constants";
import reducer from "./reducer";
import selectors from "./selectors";

class MyDomains extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
    };
  }

  componentDidMount() {
    services.provider.addEventListener(
      services.provider.EVENTS.CONNECTED,
      this.onConnect.bind(this)
    );
    services.provider.addEventListener(
      services.provider.EVENTS.DISCONNECTED,
      this.onDisconnect.bind(this)
    );
    if (!this.props.hasLoadedDomains) {
      this.loadDomains();
    }
  }

  componentWillUnmount() {
    services.provider.removeEventListener(
      services.provider.EVENTS.CONNECTED,
      this.onConnect.bind(this)
    );
    services.provider.removeEventListener(
      services.provider.EVENTS.DISCONNECTED,
      this.onDisconnect.bind(this)
    );
  }

  onConnect() {
    if (this.connectModal) {
      this.connectModal.hide();
    }
    this.loadDomains();
  }

  onDisconnect() {
    this.forceUpdate();
  }

  loadDomains() {
    if (services.provider.isConnected()) {
      this.props.loadDomains();
    }
  }

  renderDomains() {
    const reverseLookups = this.props.reverseLookups;
    if (!this.props.domainIds) return;
    let domains = this.props.domainIds.filter(
      (domain) => reverseLookups[domain]
    );
    if (this.state.search) {
      domains = domains.filter((hash) => {
        const name = reverseLookups[hash];
        return name.indexOf(this.state.search) > -1;
      });
    }
    return (
      <div>
        <div className="mt-4 dark:bg-gray-800 bg-gray-100 rounded-lg px-4">
          <div className="w-full table border-collapse">
            <div className="border-b border-gray-200 dark:border-gray-700 table-row">
              <div className="w-full py-4 md:py-6 table-cell">
                <div className="flex items-center">
                  <SearchIcon className="w-5 mx-2" />
                  <input
                    type="text"
                    placeholder="Search Domain"
                    className="w-full p-2 bg-white dark:bg-gray-800 custom-border"
                    onChange={(e) => {
                      if (this.searchTimeout) clearTimeout(this.searchTimeout);
                      this.searchTimeout = setTimeout(() => {
                        this.setState({
                          search: e.target.value.toLowerCase(),
                        });
                      }, 300);
                    }}
                  />
                </div>
              </div>
            </div>

            {domains.length > 0 ? (
              // <div className="grid sm:flex sm:justify-center sm:flex-col sm:items-center md:grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-4 md:gap-2">
              <div className="flex flex-wrap">
                {domains.map((hash, index) => {
                  const domain = reverseLookups[hash];
                  return <components.NFTCard name={domain} isLinked={true} key={index} classes="m-1 animated_border fixed-306" />;
                })}
              </div>
            ) : (
              <div className="w-full py-8 font-bold text-center">
                No results
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  renderEmpty() {
    return (
      <div className="max-w-md m-auto">
        <components.labels.Information
          text={"You do not have any registered domains"}
        />
        <div className="mt-8">
          <components.DomainSearch />
        </div>
      </div>
    );
  }

  renderDomainSection() {
    const domainCount = this.props.domainCount;
    const loadedDomainCount = this.props.loadedDomainCount;
    const pct = parseInt((loadedDomainCount / domainCount) * 100);

    if (domainCount === null)
      return (
        <div className="mt-4 dark:bg-gray-800 bg-gray-100 rounded-lg px-4 text-center py-8">
          <components.Spinner
            size="md"
            color={this.props.isDarkmode ? "#eee" : "#555"}
          />
        </div>
      );
    if (loadedDomainCount < domainCount) {
      return (
        <div className="mt-4 dark:bg-gray-800 bg-gray-100 rounded-lg px-4 text-center py-8">
          <div className="max-w-sm m-auto text-center">
            <components.ProgressBar
              progress={pct}
              className="dark:bg-gray-700"
            />
            <div className="text-sm mt-4 text-gray-900 dark:text-white">
              {"Loading domains"}
            </div>
          </div>
        </div>
      );
    }
    if (domainCount === 0 || !this.props.domainIds) return this.renderEmpty();
    return this.renderDomains();
  }

  render() {
    const reverseLookups = this.props.reverseLookups;
    let domainCount, loadedDomainCount, hiddenDomainCount;
    if (this.props.domainIds) {
      let domains = this.props.domainIds.filter(
        (domain) => reverseLookups[domain]
      );
      domainCount = this.props.domainCount;
      loadedDomainCount = this.props.loadedDomainCount;
      hiddenDomainCount = this.props.domainIds.length - domains.length;
    } else {
      hiddenDomainCount = 0;
    }
    return (
      <div className="max-w-screen-xl m-auto md:px-4">
        <>
          <div className="flex justify-between mt-2 md:mt-8 mb-4 items-center">
            <div className="text-lg font-bold pl-2">{"My Domains"}</div>
            {services.provider.isConnected() &&
            loadedDomainCount === domainCount ? (
              <div className="flex items-center">
                {this.props.hasLoadedDomains ? (
                  <div
                    className="ml-2 cursor-pointer bg-gray-100 dark:bg-gray-700 px-2 md:px-4 py-2 rounded-lg flex items-center text-sm"
                    onClick={() => this.props.loadDomains()}
                  >
                    <RefreshIcon className="w-4 md:mr-2" />
                    <div className="hidden md:block">Refresh</div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          {this.renderDomainSection()}
        </>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  domainIds: services.user.selectors.domainIds(state),
  domainCount: services.user.selectors.domainCount(state),
  loadedDomainCount: services.user.selectors.loadedDomainCount(state),
  hasLoadedDomains: selectors.hasLoadedDomains(state),
  reverseLookups: services.names.selectors.reverseLookups(state),
  isDarkmode: services.darkmode.selectors.isDarkmode(state),
  expiries: services.user.selectors.expiries(state),
});

const mapDispatchToProps = (dispatch) => ({
  loadDomains: () => dispatch(actions.loadDomains()),
});

const component = connect(mapStateToProps, mapDispatchToProps)(MyDomains);

component.redux = {
  actions,
  constants,
  reducer,
  selectors,
};

export default component;
