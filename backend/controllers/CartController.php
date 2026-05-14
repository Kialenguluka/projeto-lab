<?php
/**
 * CartController — gestão de carrinho e checkout
 */

class CartController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index(): void {
        $payload = AuthMiddleware::require();
        $items = $this->fetchCartItems((int) $payload['user_id']);
        $total = array_reduce($items, fn($sum, $item) => $sum + ($item['price'] * $item['quantity']), 0.0);
        Response::success(['items' => $items, 'total' => (float) $total], 'Cart retrieved successfully');
    }

    public function addItem(): void {
        $payload = AuthMiddleware::require();
        $body = $this->getJsonBody();

        $productId = isset($body['productId']) ? (int) $body['productId'] : 0;
        $quantity = isset($body['quantity']) ? max(1, (int) $body['quantity']) : 1;

        if ($productId <= 0) {
            Response::validation(['productId' => 'Product ID is required.']);
        }

        $product = $this->findProduct($productId);
        if (!$product || !$product['active']) {
            Response::notFound('Product not found or inactive.');
        }

        if ($quantity > $product['stock']) {
            Response::validation(['quantity' => 'Quantity exceeds available stock.']);
        }

        $userId = (int) $payload['user_id'];

        $stmt = $this->db->prepare(
            'SELECT id, quantity FROM cart_items WHERE user_id = :user_id AND product_id = :product_id LIMIT 1'
        );
        $stmt->execute(['user_id' => $userId, 'product_id' => $productId]);
        $item = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($item) {
            $newQuantity = min($product['stock'], $item['quantity'] + $quantity);
            $stmt = $this->db->prepare(
                'UPDATE cart_items SET quantity = :quantity WHERE id = :id'
            );
            $stmt->execute(['quantity' => $newQuantity, 'id' => $item['id']]);
        } else {
            $stmt = $this->db->prepare(
                'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (:user_id, :product_id, :quantity)'
            );
            $stmt->execute(['user_id' => $userId, 'product_id' => $productId, 'quantity' => $quantity]);
        }

        Response::success(['cart' => $this->fetchCartItems($userId)], 'Item added to cart successfully');
    }

    public function updateItem(?int $id): void {
        $payload = AuthMiddleware::require();
        if ($id === null || $id <= 0) {
            Response::validation(['id' => 'Cart item ID is required.']);
        }

        $body = $this->getJsonBody();
        $quantity = isset($body['quantity']) ? (int) $body['quantity'] : null;

        if ($quantity === null || $quantity < 0) {
            Response::validation(['quantity' => 'Quantity must be zero or a positive integer.']);
        }

        $userId = (int) $payload['user_id'];
        $stmt = $this->db->prepare('SELECT product_id FROM cart_items WHERE id = :id AND user_id = :user_id LIMIT 1');
        $stmt->execute(['id' => $id, 'user_id' => $userId]);
        $item = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$item) {
            Response::notFound('Cart item not found.');
        }

        if ($quantity === 0) {
            $this->removeItem($id);
        }

        $product = $this->findProduct((int) $item['product_id']);
        if (!$product || !$product['active']) {
            Response::notFound('Product not found or inactive.');
        }

        if ($quantity > $product['stock']) {
            Response::validation(['quantity' => 'Quantity exceeds available stock.']);
        }

        $stmt = $this->db->prepare('UPDATE cart_items SET quantity = :quantity WHERE id = :id');
        $stmt->execute(['quantity' => $quantity, 'id' => $id]);

        Response::success(['cart' => $this->fetchCartItems($userId)], 'Cart item updated successfully');
    }

    public function removeItem(?int $id): void {
        $payload = AuthMiddleware::require();
        if ($id === null || $id <= 0) {
            Response::validation(['id' => 'Cart item ID is required.']);
        }

        $userId = (int) $payload['user_id'];
        $stmt = $this->db->prepare('DELETE FROM cart_items WHERE id = :id AND user_id = :user_id');
        $stmt->execute(['id' => $id, 'user_id' => $userId]);

        if ($stmt->rowCount() === 0) {
            Response::notFound('Cart item not found.');
        }

        Response::success(['cart' => $this->fetchCartItems($userId)], 'Cart item removed successfully');
    }

    public function checkout(): void {
        $payload = AuthMiddleware::require();
        $userId = (int) $payload['user_id'];
        $body = $this->getJsonBody();

        $addressId = isset($body['addressId']) ? (int) $body['addressId'] : null;
        $paymentMethod = trim((string) ($body['paymentMethod'] ?? 'cash'));
        $notes = trim((string) ($body['notes'] ?? ''));

        $items = $this->fetchCartItems($userId);
        if (empty($items)) {
            Response::validation(['cart' => 'Cart is empty.']);
        }

        if ($addressId !== null) {
            $stmt = $this->db->prepare('SELECT id FROM addresses WHERE id = :id AND user_id = :user_id LIMIT 1');
            $stmt->execute(['id' => $addressId, 'user_id' => $userId]);
            if (!$stmt->fetch()) {
                Response::validation(['addressId' => 'Address not found.']);
            }
        }

        $total = 0.0;
        foreach ($items as $item) {
            if ($item['quantity'] > $item['stock']) {
                Response::validation(['stock' => "Product '{$item['name_en']}' has insufficient stock."]);
            }
            $total += $item['price'] * $item['quantity'];
        }

        $this->db->beginTransaction();
        try {
            $status = ($paymentMethod === 'card') ? 'paid' : 'pending';
            
            $stmt = $this->db->prepare(
                'INSERT INTO orders (user_id, address_id, total, status, payment_method, notes)
                 VALUES (:user_id, :address_id, :total, :status, :payment_method, :notes)'
            );
            $stmt->execute([
                'user_id' => $userId,
                'address_id' => $addressId,
                'total' => $total,
                'status' => $status,
                'payment_method' => $paymentMethod,
                'notes' => $notes,
            ]);


            $orderId = (int) $this->db->lastInsertId();

            $insertItem = $this->db->prepare(
                'INSERT INTO order_items (order_id, product_id, quantity, unit_price)
                 VALUES (:order_id, :product_id, :quantity, :unit_price)'
            );
            $updateStock = $this->db->prepare('UPDATE products SET stock = stock - :quantity WHERE id = :product_id');

            foreach ($items as $item) {
                $insertItem->execute([
                    'order_id' => $orderId,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                ]);
                $updateStock->execute(['quantity' => $item['quantity'], 'product_id' => $item['product_id']]);
            }

            $stmt = $this->db->prepare('DELETE FROM cart_items WHERE user_id = :user_id');
            $stmt->execute(['user_id' => $userId]);
            $this->db->commit();

            Response::success(['orderId' => $orderId], 'Order placed successfully', 201);
        } catch (Throwable $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    private function getJsonBody(): array {
        $body = file_get_contents('php://input');
        $payload = json_decode($body, true);
        if (!is_array($payload)) {
            Response::validation(['body' => 'Invalid JSON payload.']);
        }
        return $payload;
    }

    private function fetchCartItems(int $userId): array {
        $stmt = $this->db->prepare(
            'SELECT ci.id, ci.product_id, ci.quantity, p.name_pt, p.name_en, p.price, p.stock, p.image_url, p.active
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.user_id = :user_id'
        );
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function findProduct(int $productId): ?array {
        $stmt = $this->db->prepare('SELECT id, stock, active FROM products WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $productId]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        return $product !== false ? $product : null;
    }
}
