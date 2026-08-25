-- Additive baseline migration. No destructive reset or data loss operation.
CREATE TABLE IF NOT EXISTS forecast_points (
  location_id TEXT NOT NULL,
  run_id TEXT NOT NULL,
  model TEXT NOT NULL,
  valid_at TIMESTAMPTZ NOT NULL,
  lead_hours INTEGER NOT NULL CHECK (lead_hours >= 0),
  variable TEXT NOT NULL,
  value DOUBLE PRECISION,
  unit TEXT NOT NULL,
  aggregation TEXT,
  retrieved_at TIMESTAMPTZ NOT NULL,
  parser_version TEXT NOT NULL,
  provenance JSONB NOT NULL,
  PRIMARY KEY (location_id, run_id, valid_at, variable)
);

CREATE INDEX IF NOT EXISTS forecast_points_lookup
  ON forecast_points (location_id, model, valid_at, variable);
