# ADR-0004: theme token and class contract

- Status: Accepted
- Date: 2026-03-20

## Context

The current client already has a CSS variable and markdown class naming system, but it is implicit and app-local.

## Decision

Define a formal token and semantic class contract for renderer/editor/extension packages.
Packages must target the contract rather than importing app-local stylesheets.

## Consequences

- package theming becomes portable
- the client and third-party consumers can both theme shared packages
- Theme Studio can operate on a formal contract rather than fragile DOM assumptions
