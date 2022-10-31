//
// Helpful time functions
//
import environment from "./environment";
import axios from "axios";
const nft = {
  generateNFT: async (name, tokenId, address) => {
    const res = await axios.post(
      `${environment.BACKEND_BASE_URL}/api/generateNFT`,
      {
        name: name,
        tokenId: typeof tokenId === "bigint" ? tokenId.toString() : tokenId,
        address: address
      }
    );
    console.log(res);
    return res;
  },
  getRecentNFTs: async () => {
    const res = await axios.get(
      `${environment.BACKEND_BASE_URL}/api/getRecentNFTs`
    );
    return res.data;
  },
  getDomainsByOwner: async account => {
    const res = await axios.get(
      `${environment.BACKEND_BASE_URL}/api/getDomainsByOwner/${account}`
    );
    return res.data;
  }
};

export default nft;
