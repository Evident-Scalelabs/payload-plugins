import type { Config, PayloadRequest } from "payload";
import { describe, expect, it, vi } from "vitest";
import { abTestingPlugin } from "../../src/plugin";

const configured = abTestingPlugin({
  collections: { pages: { slugField: "path", nameField: "label", generatePath: () => null } },
  storage: { read: vi.fn(), write: vi.fn(), clear: vi.fn() },
})({ collections: [{ slug: "pages", fields: [] }] } as unknown as Config);
const endpoint = configured.endpoints!.find((entry) => entry.path === "/_ab/duplicate")!;
const request = (body: object, user: object | null = { id: 1 }) => ({
  user,
  json: async () => body,
  payload: {
    findByID: vi.fn().mockResolvedValue({ id: 1, path: "/trial" }),
    duplicate: vi.fn().mockResolvedValue({ id: 2, path: "/trial--new" }),
  },
});

describe("configured duplicate endpoint", () => {
  it("does not let anonymous readers create variants", async () => {
    const req = request({ collectionSlug: "pages", docId: "1" }, null);
    const response = await endpoint.handler(req as unknown as PayloadRequest);
    expect(response.status).toBe(401);
    expect(req.payload.duplicate).not.toHaveBeenCalled();
  });

  it("does not duplicate collections outside the configured set", async () => {
    const req = request({ collectionSlug: "users", docId: "1" });
    const response = await endpoint.handler(req as unknown as PayloadRequest);
    expect(response.status).toBe(403);
    expect(req.payload.duplicate).not.toHaveBeenCalled();
  });

  it("uses the configured path and native write access for a draft variant", async () => {
    const req = request({ collectionSlug: "pages", docId: "1", slugField: "path" });
    const response = await endpoint.handler(req as unknown as PayloadRequest);
    expect(response.status).toBe(201);
    expect(req.payload.duplicate).toHaveBeenCalledWith(
      expect.objectContaining({
        overrideAccess: false,
        draft: true,
        req,
        data: expect.objectContaining({
          path: expect.stringMatching(/^\/trial--/),
          _status: "draft",
        }),
      })
    );
  });

  it("passes the host's field mapping to its variants panel", () => {
    const field = configured.collections![0]!.fields.find(
      (f) => "name" in f && f.name === "_abVariants"
    );
    expect(field?.admin?.components?.Field).toEqual(
      expect.objectContaining({
        clientProps: { collectionSlug: "pages", slugField: "path", titleField: "label" },
      })
    );
  });
});
