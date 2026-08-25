# Provider and dataset register

This register records the operating assumptions for the initial adapters. It is
not a substitute for a commercial contract or a dataset-specific legal review.

| Capability | Provider/dataset | Source and terms | Attribution | Retention/redistribution policy |
|---|---|---|---|---|
| Forecast | Open-Meteo API output | CC BY 4.0; free endpoint is non-commercial and limited to 10,000 calls/day, 5,000/hour and 600/minute | “Weather data by Open-Meteo.com” plus upstream credits where required | Cache only within rate/terms; commercial deployment requires a paid plan or self-hosting review |
| Forecast | ECMWF Open Data | CC BY 4.0 plus ECMWF Open Data terms | Prominent ECMWF acknowledgement | Preserve source/run metadata; remove attribution if ECMWF requests it |
| Regional forecast | ItaliaMeteo/ARPAE exposed through Open-Meteo | Upstream attribution is listed by Open-Meteo as CC BY; direct ARPAE redistribution remains dataset-specific | ItaliaMeteo/ARPAE and Open-Meteo when applicable | Do not activate a direct ARPAE feed until its exact dataset terms are recorded |
| Historical climate | Copernicus/C3S via Open-Meteo | Dataset-specific C3S/Copernicus terms | Copernicus/C3S and Open-Meteo | Store dataset version and coverage; no silent mixing with observations |
| Marine | Copernicus Marine via Open-Meteo | Source-specific licence and Open-Meteo attribution requirements | Copernicus Marine and Open-Meteo | Keep coastal grid mode and source dataset in every response |

Implementation policy:

- every adapter carries `licenseRef`, `attribution`, `sourceUrl` and retrieval metadata;
- the free Open-Meteo endpoint is an evaluation/non-commercial mode, not a
  production commercial entitlement;
- provider failures and terms violations quarantine only the affected source;
- no credentials or paid endpoint is committed to the repository.

Official references: [Open-Meteo licence](https://open-meteo.com/en/license),
[Open-Meteo terms](https://open-meteo.com/en/terms),
[Open-Meteo pricing](https://open-meteo.com/en/pricing), and
[ECMWF data terms](https://apps.ecmwf.int/datasets/licences/general/).
