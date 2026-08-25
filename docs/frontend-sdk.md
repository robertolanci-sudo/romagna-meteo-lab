# Frontend, visual system e Widget SDK

## Creative direction

Dark technical UI, with aurora gradients and glass surfaces used as depth cues rather than decoration. Maps and charts are protagonists. The interface should feel like a contemporary scientific instrument: dense where analysis needs density, calm where the user needs orientation.

Tokens: near-black blue base, electric cyan/blue/violet accents, warm warning amber, semantic green/red; thin luminous borders; restrained blur; no text placed over noisy backgrounds; tabular numerals; generous section rhythm.

Core screens: Command Center, Model Compare, Marine Desk, Map Room, History/Climate, Model Battle, Widget Builder, Operations.

## Components

`LocationHeader`, `MetricRibbon`, `ForecastTimeline`, `ModelMatrix`, `ConsensusBand`, `MarineConditions`, `LayerPicker`, `TimeScrubber`, `ProvenanceBadge`, `DataQualityBadge`, `ChartWithTable`, `WidgetPreview`, `EmbedCodePanel`.

Every chart supports keyboard focus, reduced motion, screen-reader summary and a tabular fallback. Mobile defaults to a narrative overview; desktop exposes the dense matrix and map alongside charts.

## Widget SDK

```html
<div data-romagna-meteo="widget"
     data-location="rimini"
     data-theme="glass-dark"
     data-lang="it"></div>
<script defer src="https://cdn.example.invalid/romagna-meteo/widget.js"></script>
```

Modes: script embed, iframe, Web Component, REST/JSON. Initial public runtime is read-only and receives a signed/short-lived config reference. Do not expose provider credentials. Theme schema supports logo, palette, font family, radius, density, visible fields, locale, dark/light mode and reduced motion.

Version widgets independently from the main app. Enforce CSP, origin allowlist where relevant, size limits, schema validation, cache headers and deprecation policy.
