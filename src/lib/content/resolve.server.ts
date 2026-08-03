import "server-only";
import { OBJECTIONS, METHOD } from "@/content/site";
import { getContent } from "./read.server";

/**
 * Lists that live in code but whose text is editable. The shape stays fixed —
 * an editor changes wording, not how many stages the method has — so these
 * map over the code arrays and swap in any override.
 */

export async function resolvedObjections(): Promise<
  { q: string; a: string }[]
> {
  const t = await getContent();
  return OBJECTIONS.map((item, i) => ({
    q: t(`faq.${i}.q`) || item.q,
    a: t(`faq.${i}.a`) || item.a,
  }));
}

export async function resolvedMethod(): Promise<
  { index: string; name: string; summary: string; body: string; outputs: readonly string[] }[]
> {
  const t = await getContent();
  return METHOD.map((stage, i) => ({
    index: stage.index,
    name: t(`method.${i}.name`) || stage.name,
    summary: t(`method.${i}.summary`) || stage.summary,
    body: stage.body,
    outputs: stage.outputs,
  }));
}
