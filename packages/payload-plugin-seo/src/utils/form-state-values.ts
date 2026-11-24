import type { FormState } from "payload";
import * as shared from "payload/shared";

type ToValues = (fields: FormState, nest: boolean) => Record<string, unknown>;

// Payload 4 beta.8 renamed reduceFieldsToValues to getDataFromFormState (payloadcms/payload#19425).
// Look the name up at runtime so one source builds against Payload 3 and Payload 4.
const name = "getDataFromFormState" in shared ? "getDataFromFormState" : "reduceFieldsToValues";

export const formStateToValues = (shared as unknown as Record<typeof name, ToValues>)[name];
