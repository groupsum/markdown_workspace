# Page Template Demo

Containerized demo app for `@mdwrk/page-template-demo-content-pack`.

The app imports the demo content pack, compiles the exported `PageSpec` objects with `@mdwrk/lander-core`, and renders the selected page with `@mdwrk/lander-react`.

```bash
npm run build -w @mdwrk/example-page-template-demo
docker build -f examples/page-template-demo/Dockerfile -t mdwrk-page-template-demo .
docker run --rm -p 4179:80 mdwrk-page-template-demo
```
