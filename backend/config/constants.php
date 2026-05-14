<?php
/**
 * Constantes globais da aplicação
 */

// ── Base de Dados ──────────────────────────────────────────────
define('DB_DRIVER', 'mysql');        // 'mysql' | 'sqlite'
define('DB_HOST',   '127.0.0.1');
define('DB_PORT',   '3306');
define('DB_NAME',   'mini_ecommerce');
define('DB_USER',   'root');
define('DB_PASS',   '');             // Ajustar conforme ambiente

// ── JWT ────────────────────────────────────────────────────────
define('JWT_SECRET', 'ISPTEC_ENG_SW_II_SECRET_2025_CHANGE_IN_PROD');
define('JWT_EXPIRY', 3600 * 24);     // 24 horas em segundos
define('JWT_ALGO',   'HS256');

// ── CORS ───────────────────────────────────────────────────────
// Em desenvolvimento, aceitamos localhost em qualquer porta comum
define('CORS_ORIGIN',  'http://localhost:4200,http://localhost:37799,http://localhost:3000');
define('CORS_METHODS', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
define('CORS_HEADERS', 'Content-Type, Authorization, X-Requested-With');

// ── App ────────────────────────────────────────────────────────
define('APP_ENV',     'development');  // 'development' | 'production'
define('APP_VERSION', '1.0.0');
define('API_PREFIX',  '/api');

// ── Upload ─────────────────────────────────────────────────────
define('UPLOAD_DIR',      __DIR__ . '/../public/uploads/');
define('UPLOAD_MAX_SIZE', 5 * 1024 * 1024); // 5 MB
define('UPLOAD_TYPES',    ['image/jpeg', 'image/png', 'image/webp']);

// ── Paginação ──────────────────────────────────────────────────
define('DEFAULT_PAGE_SIZE', 12);
define('MAX_PAGE_SIZE',     100);
