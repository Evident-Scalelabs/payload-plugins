import type { CollectionBeforeDeleteHook } from "payload";
import { COMMENT_READS_COLLECTION_SLUG } from "../../constants";

export const cascadeDeleteUserCommentReads: CollectionBeforeDeleteHook = async ({ id, req }) => {
  if (!id) return;

  await req.payload.delete({
    collection: COMMENT_READS_COLLECTION_SLUG,
    where: { user: { equals: id } },
    overrideAccess: true,
    req,
  });
};
