# Extensions

MdWrk extensions are documented as governed workspace integrations with manifest metadata, runtime boundaries, compatibility checks, and explicit user trust policy.

Extensions let MdWrk describe additional workspace capabilities without turning the product into an unbounded runtime. The docs should explain what an extension can do, how it identifies itself, and how trust is represented.

## Manifest Metadata

The extension manifest is the first durable contract. It should describe identity, compatibility, capabilities, and package expectations in a way that can be reviewed before activation.

## Runtime Surface

Runtime surfaces may include panels, settings, commands, or workspace views. The documentation should connect these surfaces back to the local-first Markdown workflow rather than presenting extensions as unrelated widgets.

## Trust And Compatibility

Extension trust should be explicit. Users and operators need to understand which package is being used, what it can access, and whether the version is compatible with the current workspace.

## Frequently Asked Questions

### What will I learn from Extensions?

MdWrk extension docs explain manifests, host boundaries, runtime surfaces, capability expectations, and trust policy for Markdown workspace extensions.

### Who should read Extensions?

Read this page if you need practical MdWrk guidance for extensions, including the relevant workflow, product surface, and follow-up documentation paths.
