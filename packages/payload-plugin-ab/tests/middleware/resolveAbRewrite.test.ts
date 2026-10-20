import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { createResolveAbRewrite } from "../../src/middleware/resolveAbRewrite";
import type { ResolveAbRewriteCookieConfig } from "../../src/middleware/types";

interface Variant {
  bucket: string;
  passPercentage: number;
  rewritePath: string;
}

const PAGE = "/every-view";
const BUCKET_COOKIE = "payload_ab_bucket_every-view";
const EXP_COOKIE = "exp_every-view";
const NINETY_DAYS = 60 * 60 * 24 * 90;

const variantB: Variant = {
  bucket: "every-view--b",
  passPercentage: 100,
  rewritePath: "/next/every-view--b",
};

function resolve(variants: Variant[], cookie: string, cookies: ResolveAbRewriteCookieConfig = {}) {
  const resolveAbRewrite = createResolveAbRewrite<Variant>({
    cookies: { getExpCookieName: (key) => `exp_${key.replace(/^\//u, "")}`, ...cookies },
    getBucket: (v) => v.bucket,
    getPassPercentage: (v) => v.passPercentage,
    getRewritePath: (v) => v.rewritePath,
    storage: {
      clear: async () => {},
      read: async () => variants,
      write: async () => {},
    },
  });
  const request = new NextRequest(`https://example.com${PAGE}`, { headers: { cookie } });

  return resolveAbRewrite(request, PAGE, PAGE, "/next/every-view");
}

const rewriteTarget = (res: Response | null) =>
  new URL(res?.headers.get("x-middleware-rewrite") ?? "").pathname;

describe("resolveAbRewrite", () => {
  it("continues without a self rewrite when a fresh visitor is assigned the original", async () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0.99);
    try {
      const resolver = createResolveAbRewrite<Variant>({
        storage: {
          read: async () => [{ ...variantB, passPercentage: 40 }],
          write: async () => {},
          clear: async () => {},
        },
        getBucket: (v) => v.bucket,
        getPassPercentage: (v) => v.passPercentage,
        getRewritePath: (v) => v.rewritePath,
      });
      const response = await resolver(
        new NextRequest(`https://example.com${PAGE}`),
        PAGE,
        PAGE,
        PAGE
      );
      expect(response?.headers.get("x-middleware-rewrite")).toBeNull();
      expect(response?.headers.get("x-middleware-next")).toBe("1");
      expect(response?.cookies.get(BUCKET_COOKIE)?.value).toBe("original");
      expect(response?.cookies.get("ab_visitor_id")?.value).toBeTruthy();
    } finally {
      random.mockRestore();
    }
  });

  it("keeps the bucket cookie across browser sessions", async () => {
    const res = await resolve([variantB], "");

    expect(res?.cookies.get(BUCKET_COOKIE)).toMatchObject({
      maxAge: NINETY_DAYS,
      value: "every-view--b",
    });
  });

  it("uses bucketCookieMaxAge for the bucket cookie lifetime", async () => {
    const res = await resolve([variantB], "", { bucketCookieMaxAge: 3600 });

    expect(res?.cookies.get(BUCKET_COOKIE)?.maxAge).toBe(3600);
  });

  it("restores the variant from the exp cookie when the bucket cookie is gone", async () => {
    const res = await resolve([variantB], `ab_visitor_id=v1; ${EXP_COOKIE}=original`);

    expect(rewriteTarget(res)).toBe("/next/every-view");
    expect(res?.cookies.get(BUCKET_COOKIE)).toMatchObject({
      maxAge: NINETY_DAYS,
      value: "original",
    });
    expect(res?.cookies.get(EXP_COOKIE)).toBeUndefined();
  });

  it("draws a new variant when the saved bucket no longer exists", async () => {
    const res = await resolve(
      [variantB],
      `ab_visitor_id=v1; ${BUCKET_COOKIE}=every-view--gone; ${EXP_COOKIE}=every-view--gone`
    );

    expect(rewriteTarget(res)).toBe("/next/every-view--b");
    expect(res?.cookies.get(BUCKET_COOKIE)?.value).toBe("every-view--b");
    expect(res?.cookies.get(EXP_COOKIE)?.value).toBe("every-view--b");
  });

  it("sets no cookies for a returning visitor whose bucket is still live", async () => {
    const res = await resolve([variantB], `ab_visitor_id=v1; ${BUCKET_COOKIE}=every-view--b`);

    expect(rewriteTarget(res)).toBe("/next/every-view--b");
    expect(res?.headers.get("set-cookie")).toBeNull();
  });
});
