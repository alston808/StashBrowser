
  import { createRoot } from "react-dom/client";
  import { ApolloProvider } from "@apollo/client";
  import { apolloClient } from "./lib/apolloClient";
  import App from "./App.tsx";
  import "./index.css";

  createRoot(document.getElementById("root")!).render(
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  );
  