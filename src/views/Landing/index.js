import React, { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import components from "components";
import services from "services";

export default function Landing() {
  const [nfts, setNFTs] = useState({});
  const [loadingNFT, setLoadingNFT] = useState(false);
  useEffect(() => {
    async function getNFTList() {
      setLoadingNFT(true);
      const recentNFTs = await services.nft.getRecentNFTs();
      if (recentNFTs.status) {
        setNFTs(recentNFTs.nfts);
        setLoadingNFT(false);
      } else {
        console.log("no data available");
        setLoadingNFT(false);
      }
    }
    getNFTList();
  }, []);
  console.log(nfts);
  return (
    <>
      <div className="max-w-2xl m-auto mt-[30px] md:mt-[70px] lg:mt-[100px]">
        <div className="flex justify-center gap-4">
          <div>
            <img
              src={services.linking.static("images/eth.png")}
              alt="logo"
              srcSet=""
              className="w-14 h-14"
            />
          </div>
          <div className="font-bold text-center mt-4 text-4xl">{".ETH"}</div>
        </div>

        <div className="text-center max-w-sm m-auto mt-4 mb-8">
          {
            "New Generation naming service for Ethereum ecosystem and its various subnets."
          }
        </div>
        <div className="flex mb-8 mt-[50px]">
          <components.DomainSearch />
        </div>
      </div>

      <div className="mt-[50px] md:mt-[70px] lg:mt-[80px]">
        <div className="flex justify-between px-4 items-center">
          <div className="text-md md:text-lg font-semibold">
            Recently Registered:
          </div>
          <div className="mr-0 md:mr-2">
            <Button variant="text" size="sm">
              View All
            </Button>
          </div>
        </div>
        <div className="border border-gray-100 m-2 p-2">
          {!loadingNFT && nfts.length > 0 ? (
            <components.ScrollMenu
              containerId="all-game-container"
              leftButtonId="all-game-left"
              rightButtonId="all-game-right"
              size="350"
            >
              {nfts.map((nft, i) => (
                <components.NFTCard
                  name={nft.domain}
                  isLinked={true}
                  classes="m-4 animated_border"
                  key={i}
                />
              ))}
            </components.ScrollMenu>
          ) : loadingNFT ? (
            <div className="flex justify-center mx-auto ">
              <components.Spinner size="md" color={"black"} />
            </div>
          ): ("")}
        </div>
      </div>
    </>
  );
}
