<?php
/**
 * UserController — gestão de utilizadores (admin + perfil)
 */

class UserController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index(): void {
        AuthMiddleware::requireAdmin();
        $stmt = $this->db->prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        Response::success($users, 'Users retrieved successfully');
    }

    public function show(int $id): void {
        $payload = AuthMiddleware::require();
        if ($payload['role'] !== 'admin' && (int) $payload['user_id'] !== $id) {
            Response::forbidden('You may only view your own profile.');
        }

        $stmt = $this->db->prepare('SELECT id, name, email, role, created_at FROM users WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            Response::notFound('User not found.');
        }

        Response::success($user, 'User retrieved successfully');
    }

    public function update(int $id): void {
        $payload = AuthMiddleware::require();
        $currentUserId = (int) $payload['user_id'];
        $isAdmin = $payload['role'] === 'admin';

        if (!$isAdmin && $currentUserId !== $id) {
            Response::forbidden('You may only update your own profile.');
        }

        $body = $this->getJsonBody();
        $name = trim((string) ($body['name'] ?? ''));
        $email = trim((string) ($body['email'] ?? ''));
        $role = $isAdmin ? trim((string) ($body['role'] ?? '')) : null;

        $errors = [];
        if ($name === '') {
            $errors['name'] = 'Name is required.';
        }
        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'A valid email is required.';
        }
        if ($role !== null && !in_array($role, ['customer', 'admin'], true)) {
            $errors['role'] = 'Role must be customer or admin.';
        }
        if (!empty($errors)) {
            Response::validation($errors);
        }

        $stmt = $this->db->prepare('SELECT id FROM users WHERE email = :email AND id <> :id LIMIT 1');
        $stmt->execute(['email' => $email, 'id' => $id]);
        if ($stmt->fetch()) {
            Response::validation(['email' => 'Email already in use.']);
        }

        $params = ['name' => $name, 'email' => $email, 'id' => $id];
        $set = 'name = :name, email = :email';
        if ($isAdmin && $role !== null) {
            $set .= ', role = :role';
            $params['role'] = $role;
        }

        $stmt = $this->db->prepare("UPDATE users SET $set WHERE id = :id");
        $stmt->execute($params);

        if ($stmt->rowCount() === 0) {
            Response::notFound('User not found or no changes applied.');
        }

        Response::success(['id' => $id, 'name' => $name, 'email' => $email, 'role' => $role ?? $payload['role']], 'User updated successfully');
    }

    public function destroy(int $id): void {
        AuthMiddleware::requireAdmin();
        $stmt = $this->db->prepare('DELETE FROM users WHERE id = :id');
        $stmt->execute(['id' => $id]);

        if ($stmt->rowCount() === 0) {
            Response::notFound('User not found.');
        }

        Response::success([], 'User removed successfully', 204);
    }

    private function getJsonBody(): array {
        $body = file_get_contents('php://input');
        $payload = json_decode($body, true);
        if (!is_array($payload)) {
            Response::validation(['body' => 'Invalid JSON payload.']);
        }
        return $payload;
    }
}
