import views from "views";
//list your routes here
export const routes = [
  { path: "/", element: <views.Landing /> },
  { path: "/user/domains", element: <views.MyDomains /> },
  { path: "/register", element: <views.Register /> },
  { path: "/domains/:id", element: <views.Domain /> }
  //   { path: "/assets", element: <views.Assets /> },
  //   { path: "/epochs", element: <views.Epochs /> },
  //   { path: "/block/:id", element: <views.BlockDetail /> },
  //   { path: "/assets/:id", element: <views.AssetsDetail /> },
  //   { path: "/transactions", element: <views.Transactions /> },
  //   { path: "/tx/:id", element: <views.TransactionDetail /> },
  //   { path: "/address/:id", element: <views.Address /> },
  //   { path: "/domain/:id", element: <views.Domain /> },
  //   { path: "/contracts", element: <views.Contracts /> },
  //   { path: "*", element: <views.NotFound /> }
];
