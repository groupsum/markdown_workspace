---
schema: "mdwrk.page.v1"
slug: "/es/docs/quickstart/"
title: "MdWrk inicio rapido para escribir y previsualizar Markdown local"
description: "Empieza con MdWrk entendiendo el modelo local-first, el editor Markdown, la vista previa y el papel de la documentacion estatica publica."
h1: "Inicio rapido de MdWrk"
entity: "MdWrk"
intent: "aprender como empezar con MdWrk"
contentType: "docs"
updatedAt: "2026-05-06"
author: CobyCloud
locale: "es"
translationOf: "/docs/quickstart/"
localeGroup: "docs-quickstart"
subtitle: "Empieza con MdWrk abriendo el espacio de trabajo, escribiendo Markdown en el editor fuente, revisando la vista previa renderizada y usando la documentacion para entender almacenamiento local, exportacion y extensiones."
faqs:
  - question: "Que deberian leer primero los nuevos usuarios de MdWrk?"
    answer: "Los nuevos usuarios deberian leer el inicio rapido, la pagina del editor Markdown sin conexion y la pagina del espacio local-first antes de explorar extensiones y temas."
parent: "/"
related:
  - "/docs/quickstart/"
  - "/docs/extensions/"
tags:
  - docs
  - quickstart
  - markdown
---

Este inicio rapido explica el modelo publico de MdWrk antes de la implementacion. No depende de que el dominio de produccion este activo y no requiere que una aplicacion cliente renderice la pagina para explicar el producto.

## Crea Tu Primer Documento

Empieza con un documento Markdown y conserva el texto fuente como contenido legible. MdWrk trata Markdown como contenido portable, por eso el documento debe seguir siendo util fuera de un servicio alojado o de un estado propietario del editor.

1. Crea o abre un archivo Markdown en el espacio de trabajo local.
2. Agrega un titulo, una introduccion breve y al menos una seccion estructurada.
3. Guarda el archivo como Markdown plano para que el origen siga siendo portable.
4. Revisa la vista previa renderizada antes de compartir o exportar.

## Revisa La Vista Previa

Usa la vista previa para comprobar encabezados, listas, enlaces, bloques de codigo y estructura del documento. El renderizador forma parte de la historia de paquetes, asi que la documentacion publica debe describir el resultado renderizado con terminos que desarrolladores y autores puedan inspeccionar.

## Entiende Los Limites Locales

MdWrk se describe como local-first y privacy-first. Eso significa que la documentacion debe explicar que permanece local, cuando ocurre la exportacion, cuando la sincronizacion puede contactar un servicio externo y como entran las extensiones en el modelo de confianza.

## Continua Por La Documentacion

Despues de esta pagina, lee la documentacion de extensiones, paquetes de temas y comparaciones. El lander estatico genera HTML, espejos Markdown, JSON-LD, datos de sitemap, politica robots y archivos de indice LLM desde el mismo registro de contenido.
