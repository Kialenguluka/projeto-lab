<?php
/**
 * OrderController — histórico de encomendas e gestão de status
 */

class OrderController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index(): void {
        $payload = AuthMiddleware::require();
        $userId = (int) $payload['user_id'];

        if ($payload['role'] === 'admin') {
            $stmt = $this->db->query(
                'SELECT o.id, o.user_id, u.name AS user_name, u.email AS user_email, o.total, o.status, o.payment_method, o.created_at
                 FROM orders o
                 JOIN users u ON o.user_id = u.id
                 ORDER BY o.created_at DESC'
            );
            Response::success($stmt->fetchAll(PDO::FETCH_ASSOC), 'Orders retrieved successfully');
            return;
        }

        $stmt = $this->db->prepare(
            'SELECT id, user_id, total, status, payment_method, created_at FROM orders WHERE user_id = :user_id ORDER BY created_at DESC'
        );
        $stmt->execute(['user_id' => $userId]);
        Response::success(['orders' => $stmt->fetchAll(PDO::FETCH_ASSOC)], 'Orders retrieved successfully');
    }

    public function show(int $id): void {
        $payload = AuthMiddleware::require();
        $order = $this->fetchOrder($id);

        if (!$order) {
            Response::notFound('Order not found.');
        }

        if ($payload['role'] !== 'admin' && (int) $order['user_id'] !== (int) $payload['user_id']) {
            Response::forbidden('You may only view your own orders.');
        }

        $order['items'] = $this->fetchOrderItems($id);
        Response::success(['order' => $order], 'Order retrieved successfully');
    }

    public function store(): void {
        $payload = AuthMiddleware::require();
        require_once __DIR__ . '/CartController.php';
        $cartController = new CartController();
        // Reuse checkout logic via same user context.
        $cartController->checkout();
    }

    public function updateStatus(int $id): void {
        $payload = AuthMiddleware::require();
        $body = $this->getJsonBody();
        $status = trim((string) ($body['status'] ?? ''));

        $allowed = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
        if ($status === '' || !in_array($status, $allowed, true)) {
            Response::validation(['status' => 'Estado de encomenda inválido.']);
        }

        // Fetch current order to check permissions and status
        $order = $this->fetchOrder($id);
        if (!$order) {
            Response::notFound('Encomenda não encontrada.');
        }

        // Logic: 
        // 1. Admin can change to anything.
        // 2. Customer can only change TO 'cancelled' AND ONLY IF current status is 'pending'.
        if ($payload['role'] !== 'admin') {
            if ($status !== 'cancelled') {
                Response::forbidden('Apenas o administrador pode alterar este estado.');
            }
            if ($order['status'] !== 'pending') {
                Response::forbidden('Apenas encomendas pendentes podem ser canceladas pelo cliente.');
            }
            if ((int)$order['user_id'] !== (int)$payload['user_id']) {
                Response::forbidden('Não tem permissão para alterar esta encomenda.');
            }
        }

        $stmt = $this->db->prepare('UPDATE orders SET status = :status WHERE id = :id');
        $stmt->execute(['status' => $status, 'id' => $id]);

        Response::success(['id' => $id, 'status' => $status], 'Estado da encomenda actualizado com sucesso.');
    }


    public function export(int $id): void {
        $payload = AuthMiddleware::require();
        $order = $this->fetchOrder($id);

        if (!$order) {
            Response::notFound('Encomenda não encontrada.');
        }

        if ($payload['role'] !== 'admin' && (int) $order['user_id'] !== (int) $payload['user_id']) {
            Response::forbidden('Acesso negado.');
        }

        $items = $this->fetchOrderItems($id);
        
        $statusLabels = [
            'pending'   => 'Pendente',
            'paid'      => 'Paga / Confirmada',
            'shipped'   => 'Enviada',
            'delivered' => 'Entregue',
            'cancelled' => 'Cancelada'
        ];
        $currentStatus = $statusLabels[$order['status']] ?? $order['status'];

        $html = '<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="utf-8">
    <title>Fatura #' . $order['id'] . '</title>
    <style>
        body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; }
        .invoice-box { max-width: 800px; margin: auto; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,.15); padding: 30px; font-size: 16px; line-height: 24px; position: relative; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #3498db; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { color: #3498db; margin: 0; }
        .info { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .info div { width: 45%; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #f8f8f8; border-bottom: 2px solid #eee; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .total { text-align: right; margin-top: 30px; font-size: 20px; font-weight: bold; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
        .no-print { text-align: center; margin-bottom: 20px; }
        .btn-print { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 14px; }
        @media print {
            .no-print { display: none; }
            .invoice-box { box-shadow: none; border: none; }
        }
    </style>
</head>
<body>
    <div class="no-print">
        <button class="btn-print" onclick="window.print()">Imprimir / Guardar como PDF</button>
    </div>
    <div class="invoice-box">
        <div class="header">
            <div>
                <h1>MiniStore AO</h1>
                <p>ISPTEC - Engenharia de Software I<br>Luanda, Angola</p>
            </div>
            <div style="text-align: right">
                <h2>FATURA / RECIBO</h2>
                <p>#ENCO-' . str_pad((string)$order['id'], 6, '0', STR_PAD_LEFT) . '<br>Data: ' . date('d/m/Y', strtotime($order['created_at'])) . '</p>
            </div>
        </div>

        <div class="info">
            <div>
                <strong>Vendido a:</strong><br>
                ' . htmlspecialchars($order['user_name']) . '<br>
                ' . htmlspecialchars($order['user_email']) . '<br>
                Estado: <strong>' . $currentStatus . '</strong>
            </div>
            <div style="text-align: right">
                <strong>Método de Pagamento:</strong><br>
                ' . strtoupper($order['payment_method']) . '<br>
                Moeda: AOA
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Produto</th>
                    <th style="text-align: center">Qtd</th>
                    <th style="text-align: right">Preço Unit.</th>
                    <th style="text-align: right">Subtotal</th>
                </tr>
            </thead>
            <tbody>';

        foreach ($items as $item) {
            $sub = (float)$item['unit_price'] * (int)$item['quantity'];
            $html .= '<tr>
                <td>' . htmlspecialchars($item['name_pt']) . '</td>
                <td style="text-align: center">' . $item['quantity'] . '</td>
                <td style="text-align: right">' . number_format((float)$item['unit_price'], 2, ',', '.') . ' AOA</td>
                <td style="text-align: right">' . number_format($sub, 2, ',', '.') . ' AOA</td>
            </tr>';
        }

        $html .= '
            </tbody>
        </table>

        <div class="total">
            Total Geral: ' . number_format((float)$order['total'], 2, ',', '.') . ' AOA
        </div>

        <div class="footer">
            Obrigado pela sua preferência!<br>
            MiniStore AO - O seu destino de compras académico.
        </div>
    </div>
</body>
</html>';
        Export::pdf($html, 'fatura-' . $order['id']);
    }

    private function getJsonBody(): array {
        $body = file_get_contents('php://input');
        $payload = json_decode($body, true);
        if (!is_array($payload)) {
            Response::validation(['body' => 'Invalid JSON payload.']);
        }
        return $payload;
    }

    private function fetchOrder(int $id): ?array {
        $stmt = $this->db->prepare(
            'SELECT o.id, o.user_id, u.name AS user_name, u.email AS user_email, o.total, o.status, o.payment_method, o.notes, o.address_id, o.created_at, o.updated_at
             FROM orders o
             JOIN users u ON o.user_id = u.id
             WHERE o.id = :id LIMIT 1'
        );
        $stmt->execute(['id' => $id]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);
        return $order !== false ? $order : null;
    }

    private function fetchOrderItems(int $orderId): array {
        $stmt = $this->db->prepare(
            'SELECT oi.product_id, p.name_pt, p.name_en, oi.quantity, oi.unit_price
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = :order_id'
        );
        $stmt->execute(['order_id' => $orderId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
