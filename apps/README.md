# Applications

Application boundaries:

- `web`: public dashboard and browser-facing routes.
- `api`: server-side API and backend-for-frontend.

Each application owns its runtime entrypoint and may depend on shared packages,
but provider response shapes must not cross into the UI boundary.
