# Markdown Profile Evidence Lanes

- Result: passing
- Lane count: 7
- Validator: `node tools/conformance/validate-markdown-profile-evidence-lanes.mjs`

| Lane | Features | Tests | Evidence |
| --- | --- | --- | --- |
| CommonMark curated core lane | `feat:commonmark-core-subset` | `tst:packages-renderer-markdown-renderer-core-tests-commonmark-core-corpus.mjs` | `evd:markdown-profile-commonmark-core-corpus` |
| CommonMark official corpus lane | `feat:commonmark-official-corpus` | `tst:packages-renderer-markdown-renderer-core-tests-commonmark-official-corpus.mjs` | `evd:markdown-profile-commonmark-official-corpus` |
| GFM default profile lane | `feat:gfm-default-profile-subset` | `tst:packages-renderer-markdown-renderer-core-tests-gfm-default-profile.mjs` | `evd:markdown-profile-gfm-default-profile` |
| GFM official corpus lane | `feat:gfm-official-corpus` | `tst:packages-renderer-markdown-renderer-core-tests-gfm-official-corpus.mjs` | `evd:markdown-profile-gfm-official-corpus` |
| CFM optional profile lane | `feat:mdwrk-profile-front-matter`<br>`feat:mdwrk-profile-footnotes`<br>`feat:mdwrk-profile-definition-lists`<br>`feat:mdwrk-profile-math`<br>`feat:mdwrk-profile-citations`<br>`feat:mdwrk-profile-superscript`<br>`feat:mdwrk-profile-subscript`<br>`feat:mdwrk-profile-smart-punctuation`<br>`feat:mdwrk-profile-markdown-in-html` | `tst:packages-renderer-markdown-renderer-core-tests-optional-profiles.mjs` | `evd:markdown-profile-mdwrk-optional-profiles` |
| CFM custom parser behavior lane | `feat:mdwrk-custom-parser-profile` | `tst:packages-renderer-markdown-renderer-core-tests-custom-parser-profile.mjs` | `evd:markdown-profile-custom-parser-profile` |
| CFM custom previewer behavior lane | `feat:mdwrk-custom-previewer-profiles` | `tst:packages-renderer-markdown-renderer-core-tests-custom-previewer-profiles.mjs` | `evd:markdown-profile-custom-previewer-profiles` |
