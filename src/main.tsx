
  import { createRoot } from "react-dom/client";
  import { ApolloProvider } from "@apollo/client";
  import { apolloClient } from "./lib/apolloClient";
  import App from "./App.tsx";
  import Favicon from "./components/Favicon";
  import "./index.css";

  createRoot(document.getElementById("root")!).render(
    <ApolloProvider client={apolloClient}>
      <Favicon />
      <App />
    </ApolloProvider>
  );
  