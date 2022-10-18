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
        tokenId: tokenId,
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
  }
};

export default nft;
