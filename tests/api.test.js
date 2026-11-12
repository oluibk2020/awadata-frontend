import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../lib/api";

function createResponse({ status = 200, contentType = "application/json", body }) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: vi.fn().mockReturnValue(contentType),
    },
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(body),
  };
}

describe("apiFetch", () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes the endpoint and sends JSON and bearer headers", async () => {
    fetchMock.mockResolvedValue(createResponse({ body: { id: "request-1" } }));

    const result = await apiFetch(
      "research/requests",
      {
        method: "POST",
        headers: { "X-Request-ID": "trace-1" },
        body: JSON.stringify({ title: "Synthetic study" }),
      },
      "test-token"
    );

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/research\/requests$/);
    expect(options).toEqual({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-ID": "trace-1",
        Authorization: "Bearer test-token",
      },
      body: JSON.stringify({ title: "Synthetic study" }),
    });
    expect(result).toEqual({
      ok: true,
      status: 200,
      data: { id: "request-1" },
      error: null,
    });
  });

  it("wraps a plain-text success response as a message", async () => {
    fetchMock.mockResolvedValue(
      createResponse({ contentType: "text/plain", body: "Request accepted" })
    );

    await expect(apiFetch("/health")).resolves.toMatchObject({
      ok: true,
      data: { message: "Request accepted" },
    });
  });

  it("joins validation messages from an unsuccessful response", async () => {
    fetchMock.mockResolvedValue(
      createResponse({
        status: 422,
        body: { message: ["Email is required", "Password is required"] },
      })
    );

    await expect(apiFetch("/auth")).resolves.toMatchObject({
      ok: false,
      status: 422,
      error: "Email is required, Password is required",
    });
  });

  it("returns a failed result when the network request rejects", async () => {
    fetchMock.mockRejectedValue(new Error("Connection refused"));

    await expect(apiFetch("/health")).resolves.toMatchObject({
      ok: false,
      status: 0,
      error: "Connection refused",
      data: null,
    });
  });
});
