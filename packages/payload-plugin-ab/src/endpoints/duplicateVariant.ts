import { APIError, type CollectionSlug, type PayloadRequest } from "payload";
import type { CollectionABConfig } from "../types/config";
import { AB_PASS_PERCENTAGE_FIELD, AB_VARIANT_OF_FIELD, DEFAULT_SLUG_FIELD } from "../constants";

// 6-char alphanumeric hash — no external dep needed
function nanoid(): string {
  return Math.random().toString(36).slice(2, 8);
}

export const duplicateVariantHandler = async (
  req: PayloadRequest,
  collections: Record<string, Pick<CollectionABConfig, "slugField">>
) => {
  if (!req.user) return Response.json({ error: "Authentication required" }, { status: 401 });
  if (!req.payload) {
    return Response.json({ error: "Payload not available" }, { status: 500 });
  }

  let body: { collectionSlug?: string; docId?: string; slugField?: string };
  try {
    if (!req.json) {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { collectionSlug, docId } = body;

  if (!collectionSlug || !docId) {
    return Response.json({ error: "collectionSlug and docId are required" }, { status: 400 });
  }
  if (!Object.hasOwn(collections, collectionSlug)) {
    return Response.json(
      { error: "Collection is not configured for A/B testing" },
      { status: 403 }
    );
  }
  const slugField = collections[collectionSlug]!.slugField ?? DEFAULT_SLUG_FIELD;

  let parentDoc: Record<string, unknown>;
  try {
    parentDoc = (await req.payload.findByID({
      collection: collectionSlug as CollectionSlug,
      id: docId,
      depth: 0,
      overrideAccess: false,
      req,
    })) as Record<string, unknown>;

    if (!parentDoc) {
      return Response.json({ error: "Parent document not found" }, { status: 404 });
    }
  } catch {
    return Response.json({ error: "Parent document not found" }, { status: 404 });
  }

  const originalSlug = (parentDoc[slugField] as string) ?? docId;

  try {
    const newDoc = (await req.payload.duplicate({
      collection: collectionSlug as CollectionSlug,
      id: docId,
      data: {
        _status: "draft",
        [slugField]: `${originalSlug}--${nanoid()}`,
        [AB_VARIANT_OF_FIELD]: docId,
        [AB_PASS_PERCENTAGE_FIELD]: 1,
      },
      draft: true,
      overrideAccess: false,
      req,
    })) as Record<string, unknown>;

    return Response.json(
      { id: newDoc.id, slug: newDoc[slugField], passPercentage: 1 },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create variant";
    return Response.json(
      { error: message },
      { status: err instanceof APIError ? err.status : 500 }
    );
  }
};
