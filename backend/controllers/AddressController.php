<?php
/**
 * AddressController — gestão de endereços do utilizador
 */

class AddressController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index(): void {
        $payload = AuthMiddleware::require();
        $userId = (int) $payload['user_id'];

        $stmt = $this->db->prepare(
            'SELECT id, street, city, postal_code, province, is_default 
             FROM addresses 
             WHERE user_id = :user_id 
             ORDER BY is_default DESC, id DESC'
        );
        $stmt->execute(['user_id' => $userId]);
        $addresses = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::success($addresses, 'Addresses retrieved successfully');
    }

    public function store(): void {
        $payload = AuthMiddleware::require();
        $userId = (int) $payload['user_id'];
        $body = $this->getJsonBody();

        $street = trim((string) ($body['street'] ?? ''));
        $city = trim((string) ($body['city'] ?? ''));
        $postalCode = trim((string) ($body['postal_code'] ?? ''));
        $province = trim((string) ($body['province'] ?? $city)); // Default province to city if not provided

        if (empty($street) || empty($city) || empty($postalCode)) {
            Response::validation([
                'street' => $street ? null : 'Street is required',
                'city' => $city ? null : 'City is required',
                'postal_code' => $postalCode ? null : 'Postal code is required',
            ]);
        }

        $stmt = $this->db->prepare(
            'INSERT INTO addresses (user_id, street, city, postal_code, province, is_default) 
             VALUES (:user_id, :street, :city, :postal_code, :province, 0)'
        );
        $stmt->execute([
            'user_id' => $userId,
            'street' => $street,
            'city' => $city,
            'postal_code' => $postalCode,
            'province' => $province,
        ]);

        $addressId = (int) $this->db->lastInsertId();
        $address = [
            'id' => $addressId,
            'street' => $street,
            'city' => $city,
            'postal_code' => $postalCode,
            'province' => $province,
            'is_default' => false,
        ];

        Response::success($address, 'Address created successfully', 201);
    }

    public function update(?int $id): void {
        $payload = AuthMiddleware::require();
        if ($id === null || $id <= 0) {
            Response::validation(['id' => 'Address ID is required']);
        }

        $userId = (int) $payload['user_id'];
        $body = $this->getJsonBody();

        $stmt = $this->db->prepare('SELECT id FROM addresses WHERE id = :id AND user_id = :user_id');
        $stmt->execute(['id' => $id, 'user_id' => $userId]);
        if (!$stmt->fetch()) {
            Response::notFound('Address not found');
        }

        $street = trim((string) ($body['street'] ?? ''));
        $city = trim((string) ($body['city'] ?? ''));
        $postalCode = trim((string) ($body['postal_code'] ?? ''));
        $province = trim((string) ($body['province'] ?? $city)); // Default province to city if not provided
        $isDefault = isset($body['is_default']) ? (bool) $body['is_default'] : false;

        if (empty($street) || empty($city) || empty($postalCode)) {
            Response::validation([
                'street' => $street ? null : 'Street is required',
                'city' => $city ? null : 'City is required',
                'postal_code' => $postalCode ? null : 'Postal code is required',
            ]);
        }

        if ($isDefault) {
            $stmt = $this->db->prepare('UPDATE addresses SET is_default = 0 WHERE user_id = :user_id');
            $stmt->execute(['user_id' => $userId]);
        }

        $stmt = $this->db->prepare(
            'UPDATE addresses SET street = :street, city = :city, postal_code = :postal_code, 
             province = :province, is_default = :is_default WHERE id = :id'
        );
        $stmt->execute([
            'street' => $street,
            'city' => $city,
            'postal_code' => $postalCode,
            'province' => $province,
            'is_default' => $isDefault ? 1 : 0,
            'id' => $id,
        ]);

        $address = [
            'id' => $id,
            'street' => $street,
            'city' => $city,
            'postal_code' => $postalCode,
            'province' => $province,
            'is_default' => $isDefault,
        ];

        Response::success($address, 'Address updated successfully');
    }

    public function destroy(?int $id): void {
        $payload = AuthMiddleware::require();
        if ($id === null || $id <= 0) {
            Response::validation(['id' => 'Address ID is required']);
        }

        $userId = (int) $payload['user_id'];
        $stmt = $this->db->prepare('DELETE FROM addresses WHERE id = :id AND user_id = :user_id');
        $stmt->execute(['id' => $id, 'user_id' => $userId]);

        if ($stmt->rowCount() === 0) {
            Response::notFound('Address not found');
        }

        Response::success([], 'Address deleted successfully', 204);
    }

    private function getJsonBody(): array {
        $body = file_get_contents('php://input');
        $payload = json_decode($body, true);
        if (!is_array($payload)) {
            Response::validation(['body' => 'Invalid JSON payload']);
        }
        return $payload;
    }
}
