import { THEME_STUDIO_EXTENSION_ID } from "../constants.js";

export const themeStudioEsCatalog = {
  locale: "es",
  messages: {
    [`${THEME_STUDIO_EXTENSION_ID}.manifest.displayName`]: "Estudio de Temas",
    [`${THEME_STUDIO_EXTENSION_ID}.manifest.description`]: "Extensión integrada para crear temas, inspeccionar tokens, previsualizar puentes de render/editor y exportar artefactos portátiles.",
    [`${THEME_STUDIO_EXTENSION_ID}.commands.open.title`]: "Abrir Estudio de Temas",
    [`${THEME_STUDIO_EXTENSION_ID}.commands.open.description`]: "Abre el espacio integrado de edición de temas.",
    [`${THEME_STUDIO_EXTENSION_ID}.view.title`]: "Estudio de Temas",
    [`${THEME_STUDIO_EXTENSION_ID}.view.description`]: "Inspecciona, previsualiza, aplica, revierte y exporta temas según el contrato formal de tokens y clases.",
    [`${THEME_STUDIO_EXTENSION_ID}.rail.title`]: "Temas",
    [`${THEME_STUDIO_EXTENSION_ID}.panel.header.title`]: "Estudio de Temas",
    [`${THEME_STUDIO_EXTENSION_ID}.panel.header.subtitle`]: "Inspector de tokens, inspector de relaciones clase/token, vistas previas de render/editor y exportaciones portátiles.",
    [`${THEME_STUDIO_EXTENSION_ID}.panel.actions.close`]: "Cerrar",
    [`${THEME_STUDIO_EXTENSION_ID}.panel.actions.refresh`]: "Actualizar",
    [`${THEME_STUDIO_EXTENSION_ID}.panel.actions.preview`]: "Previsualizar borrador",
    [`${THEME_STUDIO_EXTENSION_ID}.panel.actions.apply`]: "Aplicar borrador",
    [`${THEME_STUDIO_EXTENSION_ID}.panel.actions.revert`]: "Revertir borrador",
    [`${THEME_STUDIO_EXTENSION_ID}.panel.actions.export`]: "Generar exportaciones",
    [`${THEME_STUDIO_EXTENSION_ID}.status.ready`]: "Listo",
    [`${THEME_STUDIO_EXTENSION_ID}.status.busy`]: "Procesando…",
    [`${THEME_STUDIO_EXTENSION_ID}.status.applied`]: "Borrador aplicado",
    [`${THEME_STUDIO_EXTENSION_ID}.status.reverted`]: "Borrador revertido",
    [`${THEME_STUDIO_EXTENSION_ID}.status.exported`]: "Exportaciones generadas"
  }
} as const;
