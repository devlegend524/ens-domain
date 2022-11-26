import { useState, useEffect } from "react";
import {
  Navbar,
  MobileNav,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Button,
  IconButton
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import services from "services";
import components from "components";
import { renderIcon } from "@download/blockies";

export default function Wrapper({ children }) {
  const [openNav, setOpenNav] = useState(false);
  const [address, setAccount] = useState(null);
  const [name, setName] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isConnected, setConnected] = useState(false);

  useEffect(() => {
    services.provider.addEventListener(
      services.provider.EVENTS.CONNECTED,
      onConnected
    );
    services.provider.addEventListener(
      services.provider.EVENTS.DISCONNECTED,
      onDisconnected
    );
  }, []);

  const onConnected = async () => {
    setConnected(true);
    const account = services.provider.getAccount();
    // const profile = await api.getProfile(account);
    // const { avatar, name } = profile;
    setAccount(account);
    // setName(name);
    // setAvatar(avatar);
  };

  const onDisconnected = () => {
    setConnected(false);
    setAccount(null);
    setName(null);
    setAvatar(null);
  };
  const getAccount = () => {
    return address.substr(0, 6) + ".." + address.substr(address.length - 4);
  };
  useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
  }, []);

  return (
    <div className="max-w-5xl custom-xl w-full p-2 mx-auto font-poppins">
      <Navbar className="mx-auto max-w-screen-xl py-2 px-2 lg:px-3 lg:py-4 shadow-none">
        <div className="container mx-auto flex items-center justify-between text-blue-gray-900">
          <Link
            to={services.linking.path("Landing")}
            variant="small"
            className="mr-4 flex items-center gap-2 cursor-pointer py-1.5 font-normal"
          >
            <img
              src={services.linking.static("images/eth.png")}
              alt="logo"
              srcSet=""
              className="w-12 h-12 inline-block"
            />
            <div className="flex flex-col">
              <div className="font-bold">WENS</div>
              <span className="text-sm hidden md:block">
                Wrapped Ethereum Name Service
              </span>
            </div>
          </Link>
          {address
            ? <div className="cursor-pointer flex items-center justify-center bg-gray-100 border border-gray-100 rounded-full py-1 px-2 dark:border-gray-600 ml-auto ">
                <div className="text-sm mr-2">
                  {name || getAccount()}
                </div>
                {avatar
                  ? <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "20px",
                        backgroundImage: `url(${avatar})`
                      }}
                      className="px-2 bg-gray-100 bg-cover bg-center"
                    />
                  : <canvas
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "20px"
                      }}
                      ref={ref => {
                        if (ref) renderIcon({ seed: address }, ref);
                      }}
                    />}
              </div>
            : <Button
                variant="text"
                size="sm"
                className="ml-auto lg:inline-block bg-gray-100 text-gray-800"
              >
                <span>Connect Wallet</span>
              </Button>}

          <Menu>
            <MenuHandler>
              <IconButton
                variant="text"
                className="flex-none h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent"
              >
                <img
                  src={services.linking.static("images/menu.png")}
                  alt="menu"
                />
              </IconButton>
            </MenuHandler>
            <MenuList>
              <MenuItem>
                <Link to={services.linking.path("MyDomains")}>
                  {"My Domains"}
                </Link>
              </MenuItem>
              <MenuItem>
                <Link to={services.linking.path("Register")}>
                  {"Register Domain"}
                </Link>
              </MenuItem>
              {isConnected
                ? <MenuItem
                    onClick={() => {
                      services.provider.disconnectWallet();
                    }}
                  >
                    Disconnect
                  </MenuItem>
                : ""}
            </MenuList>
          </Menu>
        </div>
        <MobileNav open={openNav}>
          {address
            ? <div className="cursor-pointer flex items-center justify-center border border-gray-300 rounded py-1 px-2 dark:border-gray-600">
                <div className="text-sm mr-2">
                  {name || getAccount()}
                </div>
                {avatar
                  ? <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "20px",
                        backgroundImage: `url(${avatar})`
                      }}
                      className="px-2 bg-gray-100 bg-cover bg-center"
                    />
                  : <canvas
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "20px"
                      }}
                      ref={ref => {
                        if (ref) renderIcon({ seed: address }, ref);
                      }}
                    />}
              </div>
            : <Button variant="gradient" size="sm" fullWidth className="mb-2">
                <span>Connect Wallet</span>
              </Button>}
        </MobileNav>
      </Navbar>
      <div className=" px-2 lg:px-3">
        {isConnected ? children : <components.ConnectWallet />}
      </div>
    </div>
  );
}
