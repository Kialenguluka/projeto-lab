-- =============================================================
-- Mini E-commerce — Schema Relacional + Seed Data
-- Compatível com MySQL 8+ e MariaDB 10.6+
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ── Criar base de dados ────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS mini_ecommerce
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mini_ecommerce;

-- =============================================================
-- TABELAS
-- =============================================================

-- ── categories ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name_pt  VARCHAR(100) NOT NULL,
    name_en  VARCHAR(100) NOT NULL,
    slug     VARCHAR(120) NOT NULL UNIQUE,
    active   TINYINT(1)   NOT NULL DEFAULT 1,
    created_at TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_active (active)
) ENGINE=InnoDB;

-- ── users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    email          VARCHAR(200) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    role           ENUM('customer','admin') NOT NULL DEFAULT 'customer',
    reset_token    VARCHAR(100)  DEFAULT NULL,
    reset_expires  DATETIME      DEFAULT NULL,
    created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role  (role)
) ENGINE=InnoDB;

-- ── addresses ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    label       VARCHAR(80)  NOT NULL DEFAULT 'Casa',
    street      VARCHAR(200) NOT NULL,
    city        VARCHAR(100) NOT NULL,
    province    VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20)  DEFAULT NULL,
    is_default  TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- ── products ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id     INT UNSIGNED NOT NULL,
    name_pt         VARCHAR(200) NOT NULL,
    name_en         VARCHAR(200) NOT NULL,
    description_pt  TEXT         DEFAULT NULL,
    description_en  TEXT         DEFAULT NULL,
    price           DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock           INT UNSIGNED  NOT NULL DEFAULT 0,
    image_url       VARCHAR(500)  DEFAULT NULL,
    active          TINYINT(1)    NOT NULL DEFAULT 1,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_category (category_id),
    INDEX idx_active   (active),
    INDEX idx_price    (price)
) ENGINE=InnoDB;

-- ── cart_items ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    quantity   SMALLINT UNSIGNED NOT NULL DEFAULT 1 CHECK (quantity > 0),
    added_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_product (user_id, product_id),
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── orders ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    address_id      INT UNSIGNED DEFAULT NULL,
    total           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status          ENUM('pending','processing','shipped','delivered','cancelled')
                    NOT NULL DEFAULT 'pending',
    payment_method  ENUM('cash','transfer','card') NOT NULL DEFAULT 'cash',
    notes           TEXT DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)    REFERENCES users(id)     ON DELETE RESTRICT,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL,
    INDEX idx_user   (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ── order_items ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id    INT UNSIGNED  NOT NULL,
    product_id  INT UNSIGNED  NOT NULL,
    quantity    SMALLINT UNSIGNED NOT NULL CHECK (quantity > 0),
    unit_price  DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order   (order_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================
-- SEED DATA
-- =============================================================

-- ── Categorias ────────────────────────────────────────────────
INSERT INTO categories (name_pt, name_en, slug, active) VALUES
('Electrónica',    'Electronics',    'electronica',    1),
('Vestuário',      'Clothing',       'vestuario',      1),
('Casa e Jardim',  'Home & Garden',  'casa-e-jardim',  1),
('Desporto',       'Sports',         'desporto',       1),
('Livros',         'Books',          'livros',         1);

-- ── Utilizadores (password: Admin@123 e Client@123 — bcrypt) ──
-- Hashes gerados com password_hash('Admin@123', PASSWORD_BCRYPT)
INSERT INTO users (name, email, password_hash, role) VALUES
(
    'Administrador',
    'admin@minishop.co.ao',
    '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LFvkR8HkJJqLMhxfy',
    'admin'
),
(
    'Cliente Demo',
    'cliente@minishop.co.ao',
    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC__cAdfREmZv3Ve6.5W',
    'customer'
);

-- ── Endereços do cliente demo ─────────────────────────────────
INSERT INTO addresses (user_id, label, street, city, province, postal_code, is_default) VALUES
(2, 'Casa', 'Rua do Progresso, 142', 'Luanda', 'Luanda', '1000-001', 1),
(2, 'Trabalho', 'Av. 4 de Fevereiro, 89', 'Luanda', 'Luanda', '1100-100', 0);

-- ── Produtos ─────────────────────────────────────────────────
INSERT INTO products (category_id, name_pt, name_en, description_pt, description_en, price, stock, image_url, active) VALUES
(
    1,
    'Smartphone Pro 15',
    'Smartphone Pro 15',
    'Smartphone de última geração com câmara de 200MP, bateria de 5000mAh e ecrã AMOLED 6.7".',
    'Latest generation smartphone with 200MP camera, 5000mAh battery and 6.7" AMOLED display.',
    89999.00, 25,
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    1
),
(
    1,
    'Tablet Ultra 11"',
    'Tablet Ultra 11"',
    'Tablet potente com processador octa-core, 12GB RAM e armazenamento de 256GB. Ideal para trabalho e entretenimento.',
    'Powerful tablet with octa-core processor, 12GB RAM and 256GB storage. Ideal for work and entertainment.',
    54999.00, 15,
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
    1
),
(
    1,
    'Auriculares Wireless Elite',
    'Wireless Elite Headphones',
    'Auriculares sem fios com cancelamento de ruído activo, autonomia de 40 horas e som Hi-Fi.',
    'Wireless headphones with active noise cancellation, 40-hour battery life and Hi-Fi sound.',
    24999.00, 50,
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    1
),
(
    2,
    'Camisola de Algodão Premium',
    'Premium Cotton T-Shirt',
    'Camisola 100% algodão orgânico. Disponível em várias cores e tamanhos. Lavagem a máquina.',
    '100% organic cotton t-shirt. Available in various colours and sizes. Machine washable.',
    3499.00, 200,
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    1
),
(
    2,
    'Ténis Running X500',
    'Running Sneakers X500',
    'Ténis de corrida com amortecimento avançado, sola antiderrapante e respirabilidade superior.',
    'Running shoes with advanced cushioning, anti-slip sole and superior breathability.',
    14999.00, 80,
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    1
),
(
    3,
    'Cafeteira Automática Deluxe',
    'Deluxe Automatic Coffee Maker',
    'Cafeteira automática com moedor integrado, 15 bar de pressão e capacidade para 10 chávenas.',
    'Automatic coffee maker with built-in grinder, 15 bar pressure and 10-cup capacity.',
    19999.00, 30,
    'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400',
    1
),
(
    4,
    'Bicicleta Mountain Trek Pro',
    'Mountain Trek Pro Bicycle',
    'Bicicleta de montanha com quadro de alumínio, 21 velocidades e suspensão dianteira.',
    'Mountain bike with aluminium frame, 21 speeds and front suspension.',
    74999.00, 10,
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    1
),
(
    5,
    'Engenharia de Software — Princípios e Práticas',
    'Software Engineering — Principles and Practices',
    'Livro de referência sobre engenharia de software moderno, cobrindo Agile, DevOps e arquitecturas de microserviços.',
    'Reference book on modern software engineering covering Agile, DevOps and microservice architectures.',
    5999.00, 100,
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    1
);

-- ── Pedido de demonstração ────────────────────────────────────
INSERT INTO orders (user_id, address_id, total, status, payment_method, notes) VALUES
(2, 1, 113498.00, 'delivered', 'transfer', 'Entregar antes das 18h.');

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 89999.00),
(1, 4, 1,  3499.00),
(1, 5, 1, 14999.00),
(1, 8, 3,  5999.00);
