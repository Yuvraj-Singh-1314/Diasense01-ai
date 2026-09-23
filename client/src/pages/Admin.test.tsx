import React from "react";
import { describe, expect, it, vi } from "vitest";
import ReactDOMServer from "react-dom/server";

const state = vi.hoisted(() => ({
  auth: { user: null as any, loading: false, error: null as any },
  stats: { data: undefined as any, isLoading: false, error: null as any },
}));

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => state.auth }));
vi.mock("@/lib/trpc", () => ({ trpc: { admin: { stats: { useQuery: () => state.stats } } } }));
vi.mock("wouter", () => ({ Link: ({ children }: { children: any }) => children }));

import Admin from "./Admin";

function render() {
  return ReactDOMServer.renderToStaticMarkup(<Admin />);
}

describe("Admin rendered state coverage", () => {
  it("renders the loading state", () => {
    state.auth = { user: null, loading: true, error: null };
    expect(render()).toContain("loading role check");
  });

  it("renders the unauthenticated state", () => {
    state.auth = { user: null, loading: false, error: null };
    expect(render()).toContain("Sign in required.");
  });

  it("renders the forbidden state for a signed-in non-admin", () => {
    state.auth = { user: { role: "user" }, loading: false, error: null };
    expect(render()).toContain("Admin access required.");
  });

  it("renders the statistics error state for an authenticated admin", () => {
    state.auth = { user: { role: "admin" }, loading: false, error: null };
    state.stats = { data: undefined, isLoading: false, error: new Error("database unavailable") };
    expect(render()).toContain("Metrics could not be loaded.");
  });
});
