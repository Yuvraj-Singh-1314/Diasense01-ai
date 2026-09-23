// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const statusQuery = vi.fn();
const chatMutation = vi.fn();
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: 1, name: "Test user" }, loading: false, error: null }) }));
vi.mock("@/lib/trpc", () => ({ trpc: { assistant: { status: { useQuery: () => statusQuery() }, chat: { useMutation: () => chatMutation() } } } }));
vi.mock("wouter", () => ({ Link: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a> }));
vi.mock("@/components/Map", () => ({ MapView: ({ onMapReady }: any) => { setTimeout(() => onMapReady({}), 0); return <div data-testid="doctor-map" />; } }));

import Assistant, { TypedReply, splitResponsePointers } from "./Assistant";

const successPosition = { coords: { latitude: 28.6139, longitude: 77.2090 } };

describe("Assistant location permission outcomes", () => {
  beforeEach(() => {
    statusQuery.mockReturnValue({ data: { highRisk: true, risk: 78 }, isLoading: false });
    chatMutation.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it("shows the visible fallback when a browser denies location", async () => {
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition: (_ok: unknown, denied: (reason: { code: number; PERMISSION_DENIED: number }) => void) => denied({ code: 1, PERMISSION_DENIED: 1 }) } });
    render(<Assistant />);
    fireEvent.click(screen.getByRole("button", { name: /use my location/i }));
    expect(await screen.findByText(/location permission was not granted/i)).toBeTruthy();
  });

  it("renders deterministic no-result handling after an approved test location", async () => {
    (window as any).google = { maps: { places: { PlacesService: class { nearbySearch(_: unknown, callback: (items: unknown[], status: string) => void) { callback([], "ZERO_RESULTS"); } }, PlacesServiceStatus: { OK: "OK" } } } };
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition: (success: (position: typeof successPosition) => void) => success(successPosition) } });
    render(<Assistant />);
    fireEvent.click(screen.getByRole("button", { name: /use my location/i }));
    await waitFor(() => expect(screen.getByTestId("doctor-map")).toBeTruthy());
    expect(await screen.findByText(/no nearby search result was returned/i)).toBeTruthy();
  });

  it("sorts returned clinicians by available patient rating without inventing missing data", async () => {
    (window as any).google = { maps: { places: { PlacesService: class { nearbySearch(_: unknown, callback: (items: unknown[], status: string) => void) { callback([{ name: "Near clinic", vicinity: "Near address", place_id: "near", rating: 3.8, user_ratings_total: 8, geometry: { location: { lat: () => 28.614, lng: () => 77.209 } } }, { name: "Highly rated clinic", vicinity: "Far address", place_id: "high", rating: 4.9, user_ratings_total: 52, geometry: { location: { lat: () => 28.7, lng: () => 77.3 } } }], "OK"); } }, PlacesServiceStatus: { OK: "OK" } } } };
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition: (success: (position: typeof successPosition) => void) => success(successPosition) } });
    render(<Assistant />);
    fireEvent.click(screen.getByRole("button", { name: /use my location/i }));
    expect(await screen.findByText("Near clinic")).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/sort nearby doctors/i), { target: { value: "rating" } });
    await waitFor(() => expect(screen.getAllByRole("heading", { level: 3 })[0]?.textContent).toBe("Highly rated clinic"));
    expect(screen.getByText(/4.9\/5 patient rating/i)).toBeTruthy();
  });

  it("reveals a newly generated AI reply progressively", () => {
    vi.useFakeTimers();
    render(<TypedReply content="Natural response" active />);
    expect(screen.queryByText("Natural response")).toBeNull();
    act(() => { vi.advanceTimersByTime(70); });
    expect(screen.getByText("Natural response")).toBeTruthy();
    vi.useRealTimers();
  });

  it("turns Hinglish-style response details into readable pointers", () => {
    expect(splitResponsePointers("Aap clinician se ye points discuss kar sakte hain:\n- Glucose target kya hona chahiye?\n- Diet plan kaise start karun?")).toEqual([
      { text: "Aap clinician se ye points discuss kar sakte hain:", pointer: false },
      { text: "Glucose target kya hona chahiye?", pointer: true },
      { text: "Diet plan kaise start karun?", pointer: true },
    ]);
  });

  it("cleans common markdown list markers from a Hinglish AI reply", () => {
    expect(splitResponsePointers("Aap in points par baat kar sakte hain: * **Diagnostic Tests:** HbA1c ke baare mein poochhein. * **Diet Plan:** gradual changes discuss karein.")).toEqual([
      { text: "Aap in points par baat kar sakte hain:", pointer: false },
      { text: "Diagnostic Tests: HbA1c ke baare mein poochhein.", pointer: true },
      { text: "Diet Plan: gradual changes discuss karein.", pointer: true },
    ]);
  });
});
