import { useState, useEffect } from "react";
import {
  Navbar,
  MobileNav,
  Typography,
  Button,
  IconButton
} from "@material-tailwind/react";
import services from "services";
import components from "components";

export default function Wrapper({ children }) {
  const [openNav, setOpenNav] = useState(false);
  const [account, setAccount] = useState(null);
  const [name, setName] = useState(null);
  const [avatar, setAvatar] = useState(null);

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
    const account = services.provider.getAccount();
    const api = services.provider.buildAPI();
    const profile = await api.getProfile(account);
    const { avatar, name } = profile;
    setAccount(account);
    setName(name);
    setAvatar(avatar);
  };

  const onDisconnected = () => {
    setAccount(null);
    setName(null);
    setAvatar(null);
  };
  const getAccount = () => {
    return account.substr(0, 6) + ".." + account.substr(account.length - 4);
  };
  useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
  }, []);
  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      {/* <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal"
      >
        <a href="#" className="flex items-center">
          Register
        </a>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal"
      >
        <a href="#" className="flex items-center">
          My Domains
        </a>
      </Typography> */}
    </ul>
  );
  return (
    <div className="max-w-5xl w-full p-2 mx-auto">
      <Navbar className="mx-auto max-w-screen-xl py-2 px-4 lg:px-8 lg:py-4">
        <div className="container mx-auto flex items-center justify-between text-blue-gray-900">
          <div
            as="a"
            href="#"
            variant="small"
            className="mr-4 flex items-center gap-2 cursor-pointer py-1.5 font-normal"
          >
            <img
              src={services.linking.static("images/ethereum-eth.svg")}
              alt="logo"
              srcSet=""
              className="w-12 h-12 inline-block"
            />
            <div className="flex flex-col">
              <div className="font-bold">ENS</div>
              <span className="text-sm">Ethereum Name Service</span>
            </div>
          </div>
          <div className="hidden lg:block">
            {navList}
          </div>
          {account
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
                        if (ref) renderIcon({ seed: account }, ref);
                      }}
                    />}
              </div>
            : <Button
                variant="text"
                size="sm"
                className="hidden lg:inline-block bg-gray-100 text-gray-800"
              >
                <span>Connect Wallet</span>
              </Button>}

          <IconButton
            variant="text"
            className="ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
            ripple={false}
            onClick={() => setOpenNav(!openNav)}
          >
            {openNav
              ? <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              : <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>}
          </IconButton>
        </div>
        <MobileNav open={openNav}>
          {navList}
          {account
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
                        if (ref) renderIcon({ seed: account }, ref);
                      }}
                    />}
              </div>
            : <Button variant="gradient" size="sm" fullWidth className="mb-2">
                <span>Connect Wallet</span>
              </Button>}
        </MobileNav>
      </Navbar>
      <div>
        <components.ConnectWallet />
        {children}
      </div>
    </div>
  );
}
