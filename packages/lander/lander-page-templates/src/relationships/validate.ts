import { errorDiagnostic, warningDiagnostic } from "../diagnostics.js";
import type { PageInstance, PageTemplate, RelationshipRule, TemplateDiagnostic, TemplateEdge, TemplateGraph } from "../types.js";

function edgeId(edge: TemplateEdge): string {
  return edge.id ?? `${edge.sourceId}:${edge.relationship}:${edge.targetId}`;
}

function ruleApplies(rule: RelationshipRule, source: PageInstance, target: PageInstance): boolean {
  return (
    (!rule.sourceTemplateIds || rule.sourceTemplateIds.includes(source.templateId)) &&
    (!rule.targetTemplateIds || rule.targetTemplateIds.includes(target.templateId))
  );
}

export function validateTemplateGraph(graph: TemplateGraph): TemplateDiagnostic[] {
  const diagnostics: TemplateDiagnostic[] = [];
  const templates = new Map<string, PageTemplate>(graph.templates.map((template) => [template.id, template]));
  const instances = new Map<string, PageInstance>(graph.instances.map((instance) => [instance.id, instance]));
  const rules = [...(graph.rules ?? []), ...graph.templates.flatMap((template) => template.rules ?? [])];

  for (const template of graph.templates) {
    const slotIds = new Set<string>();
    for (const slot of template.linkSlots ?? []) {
      if (slotIds.has(slot.id)) {
        diagnostics.push(errorDiagnostic({
          code: "template.linkSlot.duplicate",
          message: `Template ${template.id} declares duplicate link slot ${slot.id}.`,
          templateId: template.id,
        }));
      }
      slotIds.add(slot.id);
    }
  }

  for (const instance of graph.instances) {
    if (!templates.has(instance.templateId)) {
      diagnostics.push(errorDiagnostic({
        code: "instance.template.missing",
        message: `Instance ${instance.id} references missing template ${instance.templateId}.`,
        instanceId: instance.id,
        templateId: instance.templateId,
      }));
    }
  }

  for (const edge of graph.edges) {
    const source = instances.get(edge.sourceId);
    const target = instances.get(edge.targetId);
    if (!source) {
      diagnostics.push(errorDiagnostic({ code: "edge.source.missing", message: `Edge ${edgeId(edge)} references missing source.`, edgeId: edge.id }));
      continue;
    }
    if (!target) {
      diagnostics.push(errorDiagnostic({ code: "edge.target.missing", message: `Edge ${edgeId(edge)} references missing target.`, edgeId: edge.id }));
      continue;
    }

    const sourceTemplate = templates.get(source.templateId);
    const slot = sourceTemplate?.linkSlots?.find((item) => item.id === edge.slotId || item.relationship === edge.relationship);
    if (edge.slotId && !slot) {
      diagnostics.push(errorDiagnostic({
        code: "edge.slot.missing",
        message: `Edge ${edgeId(edge)} targets missing slot ${edge.slotId}.`,
        edgeId: edge.id,
        instanceId: source.id,
        templateId: source.templateId,
      }));
    }
    if (slot?.targetTemplateIds && !slot.targetTemplateIds.includes(target.templateId)) {
      diagnostics.push(errorDiagnostic({
        code: "edge.slot.target.invalid",
        message: `Edge ${edgeId(edge)} links slot ${slot.id} to incompatible template ${target.templateId}.`,
        edgeId: edge.id,
        instanceId: source.id,
        templateId: source.templateId,
      }));
    }

    const matchingRule = rules.find((rule) => rule.relationship === edge.relationship && ruleApplies(rule, source, target));
    if (rules.some((rule) => rule.relationship === edge.relationship) && !matchingRule) {
      diagnostics.push(warningDiagnostic({
        code: "edge.rule.unmatched",
        message: `Edge ${edgeId(edge)} has no matching relationship rule.`,
        edgeId: edge.id,
        instanceId: source.id,
      }));
    }
  }

  for (const instance of graph.instances) {
    const template = templates.get(instance.templateId);
    if (!template) continue;
    for (const slot of template.linkSlots ?? []) {
      const count = graph.edges.filter((edge) => edge.sourceId === instance.id && (edge.slotId === slot.id || edge.relationship === slot.relationship)).length;
      if ((slot.cardinality === "one" || slot.cardinality === "many") && count === 0) {
        diagnostics.push(errorDiagnostic({
          code: "slot.required.missing",
          message: `Instance ${instance.id} is missing required link slot ${slot.id}.`,
          instanceId: instance.id,
          templateId: template.id,
        }));
      }
      if ((slot.cardinality === "one" || slot.cardinality === "optional_one") && count > 1) {
        diagnostics.push(errorDiagnostic({
          code: "slot.cardinality.exceeded",
          message: `Instance ${instance.id} has too many links for slot ${slot.id}.`,
          instanceId: instance.id,
          templateId: template.id,
        }));
      }
    }
  }

  return diagnostics;
}
