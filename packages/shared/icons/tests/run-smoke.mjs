import assert from "node:assert/strict";
import {
  WORKSPACE_ICON_CATALOG,
  WORKSPACE_ICON_IDS,
  getWorkspaceIconDefinition,
} from "../dist/index.js";

assert.equal(WORKSPACE_ICON_CATALOG.length, WORKSPACE_ICON_IDS.length);
assert.equal(new Set(WORKSPACE_ICON_IDS).size, WORKSPACE_ICON_IDS.length);

for (const id of WORKSPACE_ICON_IDS) {
  const definition = getWorkspaceIconDefinition(id);
  assert.ok(definition, `missing catalog definition for ${id}`);
  assert.equal(definition.id, id);
  assert.ok(definition.lucideName.length > 0);
}

const requiredMobileActionIconIds = [
  "workspace.project.open",
  "workspace.file.import",
  "workspace.file.open",
  "workspace.folder.create",
  "workspace.settings.gestures",
  "workspace.settings.keyboard",
  "workspace.action.rail",
  "workspace.action.more",
  "workspace.layout.single",
  "workspace.layout.split",
  "workspace.sidebar.toggle",
  "workspace.zoom.in",
  "workspace.zoom.out",
  "workspace.zoom.reset",
  "extension.language-pack-studio",
];

for (const id of requiredMobileActionIconIds) {
  assert.ok(WORKSPACE_ICON_IDS.includes(id), `missing audited icon id ${id}`);
}

assert.equal(getWorkspaceIconDefinition("workspace.settings.gestures")?.lucideName, "Hand");
assert.equal(getWorkspaceIconDefinition("workspace.settings.keyboard")?.lucideName, "Keyboard");
assert.equal(getWorkspaceIconDefinition("workspace.action.rail")?.category, "navigation");

console.log("icons smoke: ok");
