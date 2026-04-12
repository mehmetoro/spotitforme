-- Kullanıcılardan gelen ürün/link kalite geri bildirimleri
CREATE TABLE IF NOT EXISTS product_user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  product_url TEXT NOT NULL,
  record_title TEXT,
  report_reason TEXT NOT NULL,
  report_status TEXT NOT NULL DEFAULT 'open',
  reporter_user_id UUID,
  reporter_name TEXT,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT product_user_reports_table_name_check
    CHECK (table_name IN ('sightings', 'quick_sightings')),
  CONSTRAINT product_user_reports_reason_check
    CHECK (report_reason IN ('out_of_stock', 'broken_page', 'prohibited_product', 'not_rare')),
  CONSTRAINT product_user_reports_status_check
    CHECK (report_status IN ('open', 'reviewed', 'resolved', 'dismissed'))
);

CREATE INDEX IF NOT EXISTS product_user_reports_created_at_idx
  ON product_user_reports(created_at DESC);

CREATE INDEX IF NOT EXISTS product_user_reports_status_idx
  ON product_user_reports(report_status, report_reason);

CREATE INDEX IF NOT EXISTS product_user_reports_record_idx
  ON product_user_reports(table_name, record_id, report_reason);
