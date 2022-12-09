//
// This service is responsible for
// interacting with the chain.
// Portions of this service will be
// extracted later for the public
// API clients.
//
import { ethers } from "ethers";
import client from "clients";

import services from "services";

class WensClient {
  constructor(chainId, account, signerOrProvider) {
    this.chainId = parseInt(chainId);
    this.wens = new client(signerOrProvider, {
      chainId
    });
    this.contracts = this.wens.contracts;

    this.account = account;
    this.signer = signerOrProvider;
    this.DOMAIN_STATUSES = [
      "AVAILABLE",
      "REGISTERED_OTHER",
      "REGISTERED_SELF"
    ].reduce((sum, curr) => {
      sum[curr] = curr;
      return sum;
    }, {});
    this.client = client;
  }

  async tokenExists(hash) {
    const exists = await this.contracts.Domain.exists(hash);
    return exists;
  }

  async ownerOf(hash) {
    const owner = await this.contracts.Domain.creators(hash);
    return owner;
  }

  async getDomainsByOwner(account) {
    const domains = await services.nft.getDomainsByOwner(account);
    return domains;
  }

  async getTokenOfOwnerByIndex(account, index) {
    let id = await this.contracts.Domain.tokenOfOwnerByIndex(
      account,
      index.toString()
    );
    return id;
  }

  async isAuctionPeriod(auctionPhases) {
    const biddingStartsAt = parseInt(auctionPhases[0]) * 1000;
    const claimEndsAt = parseInt(auctionPhases[3]) * 1000;
    const now = parseInt(Date.now());
    return now >= biddingStartsAt && now < claimEndsAt;
  }

  async isBiddingOpen(auctionPhases) {
    const biddingStartsAt = parseInt(auctionPhases[0]) * 1000;
    const revealStartsAt = parseInt(auctionPhases[1]) * 1000;
    const now = parseInt(Date.now());
    return now >= biddingStartsAt && now < revealStartsAt;
  }

  async isRegistrationPeriod() {
    return true;
  }

  // ESTIMATE
  async getNamePrice(domain) {
    const name = domain.split(".")[0];
    let priceUSDCents = "500";
    if (name.length === 3) {
      priceUSDCents = "900";
    } else if (name.length === 4) {
      priceUSDCents = "700";
    }
    return priceUSDCents;
  }

  async getNamePriceWETH(domain, conversionRate) {
    const _priceUSD = await this.getNamePrice(domain);
    const priceUSD = ethers.BigNumber.from(_priceUSD);
    const priceWETH = priceUSD.mul(conversionRate);
    return priceWETH;
  }

  async nameHash(name) {
    const hash = await client.utils.nameHash(name);
    return hash;
  }

  async isSupported(name) {
    // checks whether a given name is supported by the system
    if (!name) return false;
    const hash = await client.utils.nameHash(name);
    if (client.blocklist.isBlocked(hash)) return false;
    const split = name.split(".");
    if (split.length !== 2) return false;
    if (split[1] !== "eth") return false;
    if (split[0].length < 1) return false;
    if (split[0].length > 62) return false;
    if (split[0].length >= 4 && split[0][2] === "-" && split[0][3] === "-")
      return false;
    return true;
  }

  async getWETHConversionRateFromChainlink(address) {
    let oracle = new ethers.Contract(
      address,
      services.abi.chainlink,
      this.signer
    );
    let roundData = await oracle.latestRoundData();
    let rate = roundData[1].toString();

    // add a buffer to the rate, so that we can have less chance of getting a revert due to not enough WETH
    rate = ethers.BigNumber.from(rate).div("10").mul("9").toString();

    return rate;
  }

  async getWETHConversionRate() {
    // this is just fixed price for now based on latestRound from oracle
    let rate;
    if (this.chainId === 1) {
      rate = await this.getWETHConversionRateFromChainlink(
        "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
      );
    } else if (this.chainId === 5) {
      rate = await this.getWETHConversionRateFromChainlink(
        "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
      );
    }
    return ethers.BigNumber.from("10").pow("24").div(rate);
  }

  async revealDomain(domain) {
    const preimage = await client.utils.encodeNameHashInputSignals(domain);
    const hash = await client.utils.nameHash(domain);
    const tx = await this.contracts.RainbowTable.reveal(preimage, hash);
    await tx.wait();
  }

  async loadDomain(domain) {
    // hash the name
    const hash = await client.utils.nameHash(domain);
    const tokenExists = await this.tokenExists(hash);
    let domainStatus;
    let owner = null;

    if (tokenExists) {
      owner = await this.ownerOf(hash);
      if (
        owner &&
        this.account &&
        owner.toLowerCase() === this.account.toLowerCase()
      )
        domainStatus = this.DOMAIN_STATUSES.REGISTERED_SELF;
      else domainStatus = this.DOMAIN_STATUSES.REGISTERED_OTHER;
    } else {
      domainStatus = this.DOMAIN_STATUSES.AVAILABLE;
    }

    let priceUSDCents = await this.getNamePrice(domain);
    let wethConversionRate = await this.getWETHConversionRate();
    let priceWETHEstimate = wethConversionRate
      .mul(ethers.BigNumber.from(priceUSDCents))
      .toString();

    return {
      constants: {
        DOMAIN_STATUSES: this.DOMAIN_STATUSES
      },
      supported: await this.isSupported(domain, hash),
      domain,
      hash: hash.toString(),
      owner,
      status: domainStatus,
      priceUSDCents,
      priceWETHEstimate,
      timestamp: parseInt(Date.now() / 1000)
    };
  }

  async generateDomainPriceProof(domain) {
    const domainSplit = domain.split(".");
    const name = domainSplit[0];
    const nameArr = await client.utils.string2AsciiArray(name, 62);
    const namespace = domainSplit[domainSplit.length - 1];
    const namespaceHash = await client.utils.nameHash(namespace);

    console.log("generateDomainPriceProof -------", namespaceHash.toString())
    const hash = await client.utils.nameHash(domain);
    let minLength = name.length;
    console.log(minLength);
    if (name.length >= 6) minLength = 6;
    const inputs = {
      namespaceId: namespaceHash.toString(),
      name: nameArr,
      hash: hash.toString(),
      minLength
    };
    const proveRes = await services.circuits.prove("PriceCheck", inputs);
    const verify = await services.circuits.verify("PriceCheck", proveRes);
    if (!verify) throw new Error("Failed to verify");
    const calldata = await services.circuits.calldata(proveRes);
    return {
      proveRes,
      calldata
    };
  }

  async generateConstraintsProof(domain) {
    const split = domain.split(".");
    const _name = split[0];
    const _namespace = split[1];
    const namespace = await client.utils.string2AsciiArray(_namespace, 62);
    const name = await client.utils.string2AsciiArray(_name, 62);
    const hash = await client.utils.nameHash(domain);
    const inputs = {
      namespace,
      name,
      hash: hash.toString()
    };
    const proveRes = await services.circuits.prove("Constraints", inputs);
    const verify = await services.circuits.verify("Constraints", proveRes);
    if (!verify) throw new Error("Failed to verify");
    const calldata = await services.circuits.calldata(proveRes);
    return {
      proveRes,
      calldata
    };
  }

  async commit(domains, quantities, constraintsProofs, pricingProofs, salt) {
    let hashes = [];
    for (let i = 0; i < domains.length; i += 1) {
      let hash = await client.utils.nameHash(domains[i]);
      hashes.push(hash.toString());
    }
    const hash = await client.utils.registrationCommitHash(
      hashes,
      quantities,
      constraintsProofs,
      pricingProofs,
      salt
    );
    const tx = await this.contracts.LeasingAgent.commit(hash);
    await tx.wait();
    return hash;
  }

  async _getRegistrationArgs(domains, quantities) {
    let hashes = [];
    let total = ethers.BigNumber.from("0");
    const conversionRate = await this.getWETHConversionRate();
    console.log(domains.length);
    for (let i = 0; i < domains.length; i += 1) {
      let hash = await client.utils.nameHash(domains[i]);
      console.log(quantities[i]);
      hashes.push(hash.toString());
      let namePrice = await this.getNamePriceWETH(domains[i], conversionRate);
      total = total.add(
        ethers.BigNumber.from(quantities[i].toString()).mul(namePrice)
      );
    }
    return {
      total,
      hashes
    };
  }

  _getTreasuryGasSurplus() {
    return ethers.BigNumber.from("20000");
  }

  async register(domains, quantities, constraintsProofs, pricingProofs) {
    const { total, hashes } = await this._getRegistrationArgs(
      domains,
      quantities
    );
    const value = total;
    const gasEstimate = await this.contracts.LeasingAgent.estimateGas.register(
      hashes,
      quantities,
      constraintsProofs,
      pricingProofs,
      {
        value
      }
    );
    const gasLimit = gasEstimate.add(
      this._getTreasuryGasSurplus().mul(hashes.length)
    );
    const registerTx = await this.contracts.LeasingAgent.register(
      hashes,
      quantities,
      constraintsProofs,
      pricingProofs,
      {
        gasLimit,
        value
      }
    );
    await registerTx.wait();
  }

  async registerWithPreimage(domains, quantities, lengths, preimages) {
    const { total, hashes } = await this._getRegistrationArgs(
      domains,
      quantities
    );
    console.log("-------- names quantities", hashes, quantities)
    
    const value = total;
    const gasEstimate = await this.contracts.LeasingAgent.estimateGas.registerWithPreimage(
      hashes,
      quantities,
      lengths,
      preimages,
      {
        value
      }
    );

    const gasLimit = gasEstimate.add(
      this._getTreasuryGasSurplus().mul(hashes.length)
    );
    
    const registerTx = await this.contracts.LeasingAgent.registerWithPreimage(
      hashes,
      quantities,
      lengths,
      preimages,
      {
        gasLimit,
        value
      }
    );
    await registerTx.wait();
  }

  async generateNFTImage(names) {
    console.log("domain name: ", names);
    if (this.account) {
      for (let i = 0; i < names.length; i += 1) {
        let hash = await client.utils.nameHash(names[i]);
        await services.nft.generateNFT(
          names[i],
          hash,
          this.account.toLowerCase()
        );
      }
    }
  }

  async bid(hashes) {
    const tx = await this.contracts.SunriseAuction.bid(hashes);
    await tx.wait();
  }

  async reveal(names, amounts, salt) {
    const tx = await this.contracts.SunriseAuction.reveal(names, amounts, salt);
    await tx.wait();
  }

  async revealWithPreimage(names, amounts, salt, preimages) {
    const tx = await this.contracts.SunriseAuction.revealWithPreimage(
      names,
      amounts,
      salt,
      preimages
    );
    await tx.wait();
  }

  async getWinningBid(name) {
    const hash = await client.utils.nameHash(name);
    let result;
    try {
      const output = await this.contracts.SunriseAuction.getWinningBid(
        hash.toString()
      );
      try {
        const owner = await this.ownerOf(hash.toString());
        result = {
          type: "IS_CLAIMED",
          owner,
          winner: output.winner,
          auctionPrice: output.auctionPrice.toString(),
          isWinner: output.winner.toLowerCase() === this.account
        };
      } catch (err) {
        result = {
          type: "HAS_WINNER",
          winner: output.winner,
          auctionPrice: output.auctionPrice.toString(),
          isWinner: output.winner.toLowerCase() === this.account
        };
      }
    } catch (err) {
      result = {
        type: "NO_WINNER"
      };
      console.log(err);
    }
    return result;
  }

  getWwethContract() {
    let contract;
    if (this.chainId === 31337) {
      contract = this.contracts.MockWweth;
    } else if (this.chainId === 43113) {
      contract = new ethers.Contract(
        "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
        services.abi.wweth,
        this.signer
      );
    } else if (this.chainId === 43114) {
      contract = new ethers.Contract(
        "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        services.abi.wweth,
        this.signer
      );
    }
    return contract;
  }

  async getWwethBalance() {
    const contract = this.getWwethContract();
    const balance = await contract.balanceOf(this.account);
    return balance.toString();
  }

  async getAuctionWweth() {
    const contract = this.getWwethContract();
    const allowance = await contract.allowance(
      this.account,
      this.contracts.SunriseAuction.address
    );
    return allowance.toString();
  }

  async wrapWeth(amount) {
    const contract = this.getWwethContract();
    const tx = await contract.deposit({
      value: amount
    });
    await tx.wait();
  }

  async approveWwethForAuction(amount) {
    const contract = this.getWwethContract();
    const tx = await contract.approve(
      this.contracts.SunriseAuction.address,
      amount
    );
    await tx.wait();
  }

  async getRevealedBidForSenderCount() {
    const count = await this.contracts.SunriseAuction.getRevealedBidForSenderCount();
    return count;
  }

  async getRevealedBidForSenderAtIndex(index) {
    const bid = await this.contracts.SunriseAuction.getRevealedBidForSenderAtIndex(
      index
    );
    let nameSignal, preimage;
    try {
      nameSignal = await this.contracts.RainbowTable.lookup(bid.name);
      preimage = await client.utils.decodeNameHashInputSignals(nameSignal);
    } catch (err) {
      preimage = null;
    }
    return {
      name: bid.name,
      amount: bid.amount,
      timestamp: bid.timestamp,
      preimage: preimage
    };
  }

  async checkHasAccount() {
    // check if there is an account on-chain
    const hasAccount = await this.contracts.AccountGuard.addressHasAccount(
      this.account
    );
    return hasAccount;
  }

  async submitAccountVerification(signature) {
    const tx = await this.contracts.AccountGuard.verify(
      ethers.utils.getAddress(this.account),
      signature
    );
    await tx.wait();
  }

  async buildPreimages(names) {
    let signal = [];
    for (let i = 0; i < names.length; i += 1) {
      let _sig = await client.utils.encodeNameHashInputSignals(names[i]);
      signal = signal.concat(_sig);
    }
    return signal;
  }

  async lookupPreimage(hash) {
    const output = await this.contracts.RainbowTable.lookup(hash);
    const name = await client.utils.decodeNameHashInputSignals(output);
    return name;
  }

  async isPreimageRevealed(hash) {
    const output = await this.contracts.RainbowTable.isRevealed(hash);
    return output;
  }

  getDefaultResolverAddress() {
    return this.contracts.PublicResolver.address;
  }

  async getResolver(domain) {
    let hash = await client.utils.nameHash(domain);
    const resolver = await this.contracts.ResolverRegistry.get(hash.toString(), hash.toString());
    return resolver;
  }

  async setResolver(domain, address) {
    const hash = await client.utils.nameHash(domain);
    const defaultResolverAddress = this.getDefaultResolverAddress();
    let datasetId;
    if (address === defaultResolverAddress) {
      datasetId = hash;
    } else {
      // otherwise, we are setting it to None
      datasetId = 0;
    }
    const contract = await this.contracts.ResolverRegistry;
    const tx = await contract.set(hash, [], address, datasetId);
    await tx.wait();
  }

  async setStandardRecord(domain, type, value) {
    const hash = await client.utils.nameHash(domain);
    const tx = await this.contracts.PublicResolver.setStandard(
      hash,
      [],
      type,
      value
    );
    await tx.wait();
  }

  async getStandardRecords(domain) {
    // this won't work for subdomains yet.
    const hash = await client.utils.nameHash(domain);
    const promises = this.wens.RECORDS._LIST.map(r =>
      this.contracts.PublicResolver.resolveStandard(hash, hash, r.key)
    );
    const results = await Promise.all(promises);
    return results
      .map((res, index) => {
        return {
          type: index + 1,
          value: res
        };
      })
      .filter(res => res.value !== "");
  }

  async getReverseRecords(domain) {
    const hash = await client.utils.nameHash(domain);
    const promises = [
      this.wens.contracts.EVMReverseResolver.getEntry(hash, hash)
    ];
    const results = await Promise.all(promises);
    return {
      [this.wens.RECORDS.EVM]:
        results[0] === "0x0000000000000000000000000000000000000000"
          ? null
          : results[0]
    };
  }

  async getProfile(address) {
    const hash = await this.wens.reverse(this.wens.RECORDS.EVM, address);
    let _name, name, avatar;
    try {
      _name = await hash.lookup();
    } catch (err) {}
    if (_name) {
      name = _name.name;
      const _avatar = await _name.resolve(this.wens.RECORDS.AVATAR);
      if (_avatar) avatar = _avatar;
    }
    return {
      name,
      avatar
    };
  }

  async setEVMReverseRecord(domain) {
    let hash = await client.utils.nameHash(domain);
    const tx = await this.wens.contracts.EVMReverseResolver.set(hash.toString(), []);
    await tx.wait();
  }

  async getBalance() {
    const balance = await this.signer.getBalance();
    return balance;
  }

  async transferDomain(domain, address) {
    const tokenId = await client.utils.nameHash(domain);
    const tx = await this.contracts.Domain[
      "safeTransferFrom(address,address,uint256)"
    ](this.account, address, tokenId);
    await tx.wait();
  }
}

export default WensClient;
