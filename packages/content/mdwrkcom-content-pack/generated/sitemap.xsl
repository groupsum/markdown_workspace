<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>MdWrk Sitemap</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          :root { color-scheme: light; --bg: #f8fafc; --ink: #18212f; --muted: #5b6676; --panel: #ffffff; --line: #cbd5e1; --accent: #2563eb; }
          * { box-sizing: border-box; }
          body { margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.55 Georgia, "Times New Roman", serif; }
          main { width: min(1180px, calc(100% - 2rem)); margin: 0 auto; padding: 3rem 0; }
          h1 { margin: 0; font-size: 3rem; line-height: 1; letter-spacing: 0; }
          p { max-width: 66ch; color: var(--muted); }
          table { width: 100%; margin-top: 2rem; border-collapse: collapse; overflow-wrap: anywhere; background: var(--panel); border: 1px solid var(--line); box-shadow: 0 24px 70px rgba(73, 45, 19, .14); }
          th, td { padding: .9rem 1rem; text-align: left; vertical-align: top; border-bottom: 1px solid var(--line); }
          th { color: #fff; background: var(--accent); font-family: ui-sans-serif, system-ui, sans-serif; font-size: .78rem; letter-spacing: .12em; text-transform: uppercase; }
          tr:last-child td { border-bottom: 0; }
          a { color: #6f3d16; font-weight: 700; }
          .alternate { color: var(--muted); font-size: .9rem; }
        </style>
      </head>
      <body>
        <main>
          <h1>MdWrk Sitemap</h1>
          <p>This is the machine-readable XML sitemap rendered as a human-readable table. Search engines read the XML nodes; browsers use this stylesheet for review.</p>
          <xsl:choose>
            <xsl:when test="sm:sitemapindex">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Sitemap</th>
                    <th scope="col">Last modified</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sm:sitemapindex/sm:sitemap">
                    <tr>
                      <td>
                        <a>
                          <xsl:attribute name="href"><xsl:value-of select="sm:loc" /></xsl:attribute>
                          <xsl:value-of select="sm:loc" />
                        </a>
                      </td>
                      <td><xsl:value-of select="sm:lastmod" /></td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:when>
            <xsl:otherwise>
          <table>
            <thead>
              <tr>
                <th scope="col">URL</th>
                <th scope="col">Last modified</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sm:urlset/sm:url">
                <tr>
                  <td>
                    <a>
                      <xsl:attribute name="href"><xsl:value-of select="sm:loc" /></xsl:attribute>
                      <xsl:value-of select="sm:loc" />
                    </a>
                    <br />
                    <xsl:for-each select="xhtml:link">
                      <span class="alternate">alternate <xsl:value-of select="@hreflang" />: <xsl:value-of select="@href" /></span>
                      <br />
                    </xsl:for-each>
                  </td>
                  <td><xsl:value-of select="sm:lastmod" /></td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
            </xsl:otherwise>
          </xsl:choose>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
