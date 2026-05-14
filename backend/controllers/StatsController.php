<?php
/**
 * StatsController — métricas do painel de admin
 */

class StatsController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function dashboard(): void {
        AuthMiddleware::requireAdmin();

        // Total de encomendas e receita
        $stmt = $this->db->query(
            "SELECT COUNT(*) AS total_orders,
                    COALESCE(SUM(total), 0) AS total_revenue,
                    SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END) AS pending_orders,
                    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered_orders,
                    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders
             FROM orders"
        );
        $orderStats = $stmt->fetch(PDO::FETCH_ASSOC);

        // Total de utilizadores
        $stmt = $this->db->query('SELECT COUNT(*) AS total_users FROM users');
        $userStats = $stmt->fetch(PDO::FETCH_ASSOC);

        // Total de produtos e produtos com stock baixo (< 5)
        $stmt = $this->db->query(
            "SELECT COUNT(*) AS total_products,
                    SUM(CASE WHEN stock < 5 AND active = 1 THEN 1 ELSE 0 END) AS low_stock_products,
                    SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) AS out_of_stock_products
             FROM products WHERE active = 1"
        );
        $productStats = $stmt->fetch(PDO::FETCH_ASSOC);

        // Total de categorias
        $stmt = $this->db->query('SELECT COUNT(*) AS total_categories FROM categories WHERE active = 1');
        $categoryStats = $stmt->fetch(PDO::FETCH_ASSOC);

        // Produtos com stock baixo (lista)
        $stmt = $this->db->query(
            "SELECT p.id, p.name_pt, p.name_en, p.stock, c.name_pt AS category_name
             FROM products p
             JOIN categories c ON p.category_id = c.id
             WHERE p.active = 1 AND p.stock < 5
             ORDER BY p.stock ASC
             LIMIT 10"
        );
        $lowStockProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Encomendas recentes (últimas 5)
        $stmt = $this->db->query(
            "SELECT o.id, u.name AS user_name, u.email AS user_email, o.total, o.status, o.created_at
             FROM orders o
             JOIN users u ON o.user_id = u.id
             ORDER BY o.created_at DESC
             LIMIT 5"
        );
        $recentOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::success([
            'orders' => [
                'total'     => (int) $orderStats['total_orders'],
                'revenue'   => (float) $orderStats['total_revenue'],
                'pending'   => (int) $orderStats['pending_orders'],
                'delivered' => (int) $orderStats['delivered_orders'],
                'cancelled' => (int) $orderStats['cancelled_orders'],
            ],
            'users' => [
                'total' => (int) $userStats['total_users'],
            ],
            'products' => [
                'total'        => (int) $productStats['total_products'],
                'low_stock'    => (int) $productStats['low_stock_products'],
                'out_of_stock' => (int) $productStats['out_of_stock_products'],
            ],
            'categories' => [
                'total' => (int) $categoryStats['total_categories'],
            ],
            'low_stock_products' => $lowStockProducts,
            'recent_orders'      => $recentOrders,
        ], 'Dashboard stats retrieved successfully');
    }
}
