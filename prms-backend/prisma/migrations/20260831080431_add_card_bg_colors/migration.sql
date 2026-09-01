-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_website_customizer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_name" TEXT NOT NULL DEFAULT 'PRMS',
    "logo_url" TEXT,
    "logo_thumb_url" TEXT,
    "light_header_bg" TEXT NOT NULL DEFAULT '#FFFFFF',
    "light_sidebar_bg" TEXT NOT NULL DEFAULT '#FFFFFF',
    "light_body_bg" TEXT NOT NULL DEFAULT '#F8FAFC',
    "light_footer_bg" TEXT NOT NULL DEFAULT '#F1F5F9',
    "light_accent_color" TEXT NOT NULL DEFAULT '#8A2BE2',
    "light_card_bg" TEXT NOT NULL DEFAULT '#FFFFFF',
    "dark_header_bg" TEXT NOT NULL DEFAULT '#1E293B',
    "dark_sidebar_bg" TEXT NOT NULL DEFAULT '#1E293B',
    "dark_body_bg" TEXT NOT NULL DEFAULT '#0F172A',
    "dark_footer_bg" TEXT NOT NULL DEFAULT '#020617',
    "dark_accent_color" TEXT NOT NULL DEFAULT '#A78BFA',
    "dark_card_bg" TEXT NOT NULL DEFAULT '#334155',
    "active_theme" TEXT NOT NULL DEFAULT 'light',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_website_customizer" ("active_theme", "company_name", "created_at", "dark_accent_color", "dark_body_bg", "dark_footer_bg", "dark_header_bg", "dark_sidebar_bg", "id", "light_accent_color", "light_body_bg", "light_footer_bg", "light_header_bg", "light_sidebar_bg", "logo_thumb_url", "logo_url", "updated_at") SELECT "active_theme", "company_name", "created_at", "dark_accent_color", "dark_body_bg", "dark_footer_bg", "dark_header_bg", "dark_sidebar_bg", "id", "light_accent_color", "light_body_bg", "light_footer_bg", "light_header_bg", "light_sidebar_bg", "logo_thumb_url", "logo_url", "updated_at" FROM "website_customizer";
DROP TABLE "website_customizer";
ALTER TABLE "new_website_customizer" RENAME TO "website_customizer";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
