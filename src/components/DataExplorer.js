import React from "react";
import services from "services";

class DataExplorer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.getWENS();

    this.vendors = {
      // block explorers
      etherscan: {
        name: "Etherscan",
        logo: services.linking.static("images/vendor/etherscan.png"),
        class: "h-12 w-12"
      },
      vscout: {
        name: "VScout",
        logo: services.linking.static("images/vendor/vscout.svg"),
        class: "h-12 w-12"
      },

      // dns & ip
      dnslookup: {
        name: "DNS-Lookup",
        logo: services.linking.static("images/vendor/dns-lookup.png"),
        class: "h-12 w-12"
      },

      ipinfo: {
        name: "ipinfo.io",
        logo: services.linking.static("images/vendor/ipinfo-io.png"),
        class: "h-12 w-12"
      },

      // ipfs
      ipfs: {
        name: "ipfs.io",
        logo: services.linking.static("images/vendor/ipfs.png"),
        class: "h-12 w-12"
      },
      cloudflare: {
        name: "Cloudflare",
        logo: services.linking.static("images/vendor/cloudflare.svg"),
        class: "h-12 w-12"
      },

      // social
      telegram: {
        name: "telegram",
        logo: services.linking.static("images/vendor/telegram.png"),
        class: "h-12 w-12"
      },
      twitter: {
        name: "twitter",
        logo: services.linking.static("images/vendor/twitter.png"),
        class: "h-12 w-12"
      },
      facebook: {
        name: "facebook",
        logo: services.linking.static("images/vendor/facebook.png"),
        class: "h-12 w-12"
      },
      email: {
        name: "email",
        logo: services.linking.static("images/vendor/gmail.png"),
        class: "h-12 w-12"
      }
    };
  }

  async getWENS() {
    const api = await services.provider.buildAPI();
    this.wens = api.wens;
  }

  renderVendor(key, getLink) {
    const vendor = this.vendors[key];
    const link = getLink(this.props.data.data);
    return (
      <a
        target="_blank"
        href={link}
        className={`cursor-pointer flex flex-col items-center justify-center rounded-xl m-auto bg-gray-100 dark:bg-gray-800 w-full h-32`}
      >
        <div className={`${vendor.class} flex items-center justify-center`}>
          <img src={vendor.logo} alt={vendor.name} className="w-full" />
        </div>
        <div className="mt-2">
          {vendor.name}
        </div>
      </a>
    );
  }

  renderEVM() {
    return (
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
        {this.renderVendor(
          "etherscan",
          d => `https://goerli.etherscan.io/address/${d}`
        )}
      </div>
    );
  }

  renderValidator() {
    return (
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
        {this.renderVendor(
          "etherscan",
          d => `https://goerli.etherscan.io/address/${d}`
        )}
      </div>
    );
  }

  renderDNS_A() {
    return (
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
        {this.renderVendor("ipinfo", d => `https://ipinfo.io/${d}`)}
      </div>
    );
  }

  renderDNS_CNAME() {
    return (
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
        {this.renderVendor("dnslookup", d => `https://dns-lookup.com/${d}`)}
      </div>
    );
  }
  renderTelegram() {
    return (
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
        {this.renderVendor("telegram", d => `https://t.me/${d}`)}
      </div>
    );
  }
  renderTwitter() {
    return (
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
        {this.renderVendor("twitter", d => `http://twitter.com/${d}`)}
      </div>
    );
  }
  renderFaceBook() {
    return (
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
        {this.renderVendor("facebook", d => `http://facebook.com//${d}`)}
      </div>
    );
  }
  renderEmail() {
    return (
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
        {this.renderVendor("email", d => `mailTo:${d}`)}
      </div>
    );
  }
  renderAvatar() {
    return (
      <div>
        <a
          href={this.props.data.data}
          target="_blank"
          className="text-center block"
        >
          <img src={this.props.data.data} className="w-40 m-auto" />
          <div className="mt-4">View image</div>
        </a>
      </div>
    );
  }

  renderContent() {
    const data = this.props.data.data;

    return (
      <div className="text-center text-blue-800 py-4">
        {data}
      </div>
    );
  }

  renderLinks() {
    const records = this.wens.RECORDS;
    switch (this.props.data.dataType) {
      case records.EVM:
        return this.renderEVM();

      case records.VALIDATOR:
        return this.renderValidator();

      case records.DNS_CNAME:
        return this.renderDNS_CNAME();

      case records.DNS_A:
        return this.renderDNS_A();

      case records.AVATAR:
        return this.renderAvatar();

      case records.DISCRIPTION:
        return this.renderContent();

      case records.TELEGRAM:
        return this.renderTelegram();

      case records.FACEBOOK:
        return this.renderFaceBook();

      case records.TWITTER:
        return this.renderTwitter();

      case records.EMAIL:
        return this.renderEmail();
    }
    return null;
  }

  getTitle() {
    const records = this.wens.RECORDS;
    let title = {
      [records.X_CHAIN]: "View on Block Explorer",
      [records.P_CHAIN]: "View on Block Explorer",
      [records.EVM]: "View on Block Explorer",
      [records.VALIDATOR]: "View on Node Explorer",
      [records.DNS_CNAME]: "DNS Information",
      [records.DNS_A]: "IP Address Information",
      [records.AVATAR]: "Preview Avatar",
      [records.DESCRIPTION]: "Description",
      [records.TELEGRAM]: "Open on Telegram",
      [records.TWITTER]: "Open on Twitter",
      [records.FACEBOOK]: "Open on Facebook",
      [records.EMAIL]: "Open Email"
    }[this.props.data.dataType];
    if (!title) title = "External Link";
    return title;
  }

  render() {
    if (!this.props.data) return null;
    if (!this.wens) return null;
    const title = this.getTitle();

    return (
      <div>
        <div className="font-bold border-b border-gray-400 pb-4 mb-4">
          {title}
        </div>
        {this.renderLinks()}
      </div>
    );
  }
}

export default DataExplorer;
