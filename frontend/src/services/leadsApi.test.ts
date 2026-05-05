import { describe, it, expect, beforeEach, afterEach } from "vitest";
import MockAdapter from "axios-mock-adapter";
import { client, fetchLeads } from "./leadsApi";

describe("fetchLeads", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(client);
    localStorage.clear();
  });

  afterEach(() => {
    mock.restore();
    localStorage.clear();
  });

  it("retorna os leads quando a API responde 200", async () => {
    const payload = [
      {
        id: "abc",
        name: "Alice",
        phone: null,
        status: "novo_lead",
        origin: "site",
        createdAt: null,
        client: null,
      },
    ];
    mock.onGet("/leads").reply(200, payload);

    await expect(fetchLeads()).resolves.toEqual(payload);
  });

  it("rejeita quando a API retorna 500 (caller cai no fallback)", async () => {
    mock.onGet("/leads").reply(500);
    await expect(fetchLeads()).rejects.toBeDefined();
  });

  it("rejeita quando a API retorna 401 sem auth", async () => {
    mock.onGet("/leads").reply(401);
    await expect(fetchLeads()).rejects.toBeDefined();
  });

  it("rejeita em erro de rede (caller cai no fallback)", async () => {
    mock.onGet("/leads").networkError();
    await expect(fetchLeads()).rejects.toBeDefined();
  });

  it("inclui Authorization Bearer quando há token em localStorage", async () => {
    localStorage.setItem("token", "jwt-test-123");
    let capturedAuth: string | undefined;
    mock.onGet("/leads").reply(config => {
      capturedAuth = config.headers?.Authorization as string | undefined;
      return [200, []];
    });

    await fetchLeads();

    expect(capturedAuth).toBe("Bearer jwt-test-123");
  });

  it("não inclui Authorization quando não há token", async () => {
    let capturedAuth: string | undefined;
    mock.onGet("/leads").reply(config => {
      capturedAuth = config.headers?.Authorization as string | undefined;
      return [200, []];
    });

    await fetchLeads();

    expect(capturedAuth).toBeUndefined();
  });
});
