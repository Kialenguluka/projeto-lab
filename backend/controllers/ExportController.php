<?php
/**
 * ExportController — exportação de relatórios CSV/PDF (admin)
 */

class ExportController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function report(): void {
        AuthMiddleware::requireAdmin();
        $format = strtolower(trim((string) ($_GET['format'] ?? 'csv')));

        $stmt = $this->db->query(
            'SELECT o.id, u.name AS customer_name, u.email AS customer_email, o.total, o.status, o.payment_method, o.created_at
             FROM orders o
             JOIN users u ON o.user_id = u.id
             ORDER BY o.created_at DESC'
        );
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($format === 'pdf') {
            $html  = '<!DOCTYPE html><html><head><meta charset="utf-8">';
            $html .= '<title>Relatorio de Encomendas</title>';
            $html .= '<style>body{font-family:Arial,sans-serif;margin:24px;}h1{color:#1a1a2e;}table{width:100%;border-collapse:collapse;margin-top:16px;}th,td{padding:8px 12px;border:1px solid #ccc;text-align:left;}th{background:#f4f4f4;font-weight:bold;}.summary{margin-top:20px;font-size:14px;}</style>';
            $html .= '</head><body>';
            $html .= '<h1>Relatorio de Encomendas — MiniShop</h1>';
            $html .= '<p>Gerado em: ' . date('d/m/Y H:i') . '</p>';
            $html .= '<table><thead><tr><th>ID</th><th>Cliente</th><th>Email</th><th>Total (AOA)</th><th>Status</th><th>Pagamento</th><th>Data</th></tr></thead><tbody>';

            $totalRevenue = 0.0;
            foreach ($orders as $order) {
                $totalRevenue += (float) $order['total'];
                $html .= sprintf(
                    '<tr><td>%s</td><td>%s</td><td>%s</td><td>%.2f</td><td>%s</td><td>%s</td><td>%s</td></tr>',
                    htmlspecialchars((string) $order['id'],           ENT_QUOTES, 'UTF-8'),
                    htmlspecialchars($order['customer_name'],         ENT_QUOTES, 'UTF-8'),
                    htmlspecialchars($order['customer_email'],        ENT_QUOTES, 'UTF-8'),
                    (float) $order['total'],
                    htmlspecialchars($order['status'],                ENT_QUOTES, 'UTF-8'),
                    htmlspecialchars($order['payment_method'],        ENT_QUOTES, 'UTF-8'),
                    htmlspecialchars($order['created_at'],            ENT_QUOTES, 'UTF-8')
                );
            }

            $html .= '</tbody></table>';
            $html .= '<div class="summary">';
            $html .= '<strong>Total de Encomendas:</strong> ' . count($orders) . ' | ';
            $html .= '<strong>Receita Total:</strong> AOA ' . number_format($totalRevenue, 2);
            $html .= '</div>';
            $html .= '</body></html>';

            Export::pdf($html, 'orders-report');
            return;
        }

        // Default: CSV
        $rows = array_map(fn($order) => [
            $order['id'],
            $order['customer_name'],
            $order['customer_email'],
            number_format((float) $order['total'], 2),
            $order['status'],
            $order['payment_method'],
            $order['created_at'],
        ], $orders);

        Export::csv(
            $rows,
            ['Order ID', 'Customer', 'Email', 'Total (AOA)', 'Status', 'Payment', 'Created At'],
            'orders-report'
        );
    }
}
