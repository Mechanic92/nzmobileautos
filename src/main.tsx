import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import { HelmetProvider } from "react-helmet-async";
import App from "../App";
import "../index.css";

const analyticsEndpoint = (import.meta as any).env?.VITE_ANALYTICS_ENDPOINT as string | undefined;
const analyticsWebsiteId = (import.meta as any).env?.VITE_ANALYTICS_WEBSITE_ID as string | undefined;

if (typeof document !== "undefined" && analyticsEndpoint && analyticsWebsiteId) {
  const normalized = analyticsEndpoint.trim().replace(/\/$/, "");
  const script = document.createElement("script");
  script.defer = true;
  script.src = `${normalized}/umami`;
  script.setAttribute("data-website-id", analyticsWebsiteId);
  document.head.appendChild(script);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <App />
        </trpc.Provider>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);
