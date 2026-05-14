<?php
/**
 * AuthController — Autenticação e recuperação de senha
 */

class AuthController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function register(): void {
        // Handle both JSON and FormData
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $confirmPassword = $_POST['confirmPassword'] ?? '';

        if (empty($_POST)) {
            $payload = $this->getJsonBody();
            $name = trim($payload['name'] ?? '');
            $email = trim($payload['email'] ?? '');
            $password = $payload['password'] ?? '';
            $confirmPassword = $payload['confirmPassword'] ?? '';
        }

        $errors = [];
        if ($name === '') $errors['name'] = 'Name is required.';
        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'A valid email is required.';
        if ($password === '') {
            $errors['password'] = 'Password is required.';
        } elseif (strlen($password) < 8) {
            $errors['password'] = 'Password must be at least 8 characters long.';
        }
        if ($password !== $confirmPassword) $errors['confirmPassword'] = 'Passwords do not match.';

        if (!empty($errors)) Response::validation($errors);

        $stmt = $this->db->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        if ($stmt->fetch()) Response::validation(['email' => 'Email already in use.']);

        $avatarPath = null;
        if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
            $avatarPath = $this->handleFileUpload($_FILES['avatar']);
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $this->db->prepare(
            'INSERT INTO users (name, email, password_hash, role, avatar) VALUES (:name, :email, :password_hash, :role, :avatar)'
        );
        $stmt->execute([
            'name' => $name,
            'email' => $email,
            'password_hash' => $passwordHash,
            'role' => 'customer',
            'avatar' => $avatarPath
        ]);

        $userId = (int) $this->db->lastInsertId();
        $user = [
            'id' => $userId,
            'name' => $name,
            'email' => $email,
            'role' => 'customer',
            'avatar' => $avatarPath
        ];

        $token = JWT::generate([
            'user_id' => $userId,
            'email' => $email,
            'role' => $user['role']
        ]);

        Response::success(['user' => $user, 'token' => $token], 'Registration successful', 201);
    }


    public function login(): void {
        $payload = $this->getJsonBody();

        $email = trim($payload['email'] ?? '');
        $password = $payload['password'] ?? '';

        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::validation(['email' => 'A valid email is required.']);
        }

        if ($password === '') {
            Response::validation(['password' => 'Password is required.']);
        }

        $stmt = $this->db->prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            Response::unauthorized('Invalid email or password.');
        }

        $userData = [
            'id' => (int) $user['id'], 
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role']
        ];

        $token = JWT::generate([
            'user_id' => $userData['id'],
            'email' => $userData['email'],
            'role' => $userData['role']
        ]);

        Response::success([
            'user' => $userData,
            'token' => $token
        ], 'Login successful');
    }

    public function logout(): void {
        AuthMiddleware::require();
        Response::success(null, 'Logout successful');
    }

    public function me(): void {
        $payload = AuthMiddleware::require();

        $stmt = $this->db->prepare('SELECT id, name, email, role, avatar FROM users WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $payload['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            Response::unauthorized('Authenticated user not found.');
        }

        Response::success(['user' => [
            'id' => (int) $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'avatar' => $user['avatar']
        ]], 'Authenticated user');
    }

    public function forgotPassword(): void {
        $payload = $this->getJsonBody();
        $email = trim($payload['email'] ?? '');

        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::validation(['email' => 'A valid email is required.']);
        }

        $stmt = $this->db->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            Response::validation(['email' => 'No user found with this email address.']);
        }

        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', time() + 3600);

        $stmt = $this->db->prepare('UPDATE users SET reset_token = :token, reset_expires = :expires WHERE id = :id');
        $stmt->execute([
            'token' => $token,
            'expires' => $expires,
            'id' => $user['id']
        ]);

        Response::success([
            'resetToken' => $token,
            'expiresAt' => $expires
        ], 'Password reset token generated.');
    }

    public function resetPassword(): void {
        $payload = $this->getJsonBody();

        $token = trim($payload['token'] ?? '');
        $password = $payload['password'] ?? '';
        $confirmPassword = $payload['confirmPassword'] ?? '';

        $errors = [];

        if ($token === '') {
            $errors['token'] = 'Reset token is required.';
        }

        if ($password === '') {
            $errors['password'] = 'Password is required.';
        } elseif (strlen($password) < 8) {
            $errors['password'] = 'Password must be at least 8 characters long.';
        }

        if ($password !== $confirmPassword) {
            $errors['confirmPassword'] = 'Passwords do not match.';
        }

        if (!empty($errors)) {
            Response::validation($errors);
        }

        $stmt = $this->db->prepare(
            'SELECT id FROM users WHERE reset_token = :token AND reset_expires >= :now LIMIT 1'
        );
        $stmt->execute([
            'token' => $token,
            'now' => date('Y-m-d H:i:s')
        ]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            Response::validation(['token' => 'Invalid or expired reset token.']);
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $this->db->prepare(
            'UPDATE users SET password_hash = :password_hash, reset_token = NULL, reset_expires = NULL WHERE id = :id'
        );
        $stmt->execute([
            'password_hash' => $passwordHash,
            'id' => $user['id']
        ]);

        Response::success(null, 'Password updated successfully.');
    }

    public function updateMe(): void {
        $payload = AuthMiddleware::require();
        $userId  = (int) $payload['user_id'];
        
        // Handle both JSON and FormData
        $name    = trim($_POST['name']    ?? '');
        $email   = trim($_POST['email']   ?? '');
        $currentPassword = $_POST['currentPassword'] ?? '';
        $newPassword     = $_POST['newPassword']     ?? '';

        if (empty($_POST)) {
            $body = $this->getJsonBody();
            $name    = trim($body['name']    ?? '');
            $email   = trim($body['email']   ?? '');
            $currentPassword = $body['currentPassword'] ?? '';
            $newPassword     = $body['newPassword']     ?? '';
        }

        $errors = [];
        if ($name === '') $errors['name'] = 'Name is required.';
        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'A valid email is required.';
        if (!empty($errors)) Response::validation($errors);

        $stmt = $this->db->prepare('SELECT id FROM users WHERE email = :email AND id <> :id LIMIT 1');
        $stmt->execute(['email' => $email, 'id' => $userId]);
        if ($stmt->fetch()) Response::validation(['email' => 'Email already in use.']);

        $params = ['name' => $name, 'email' => $email, 'id' => $userId];
        $set    = 'name = :name, email = :email';

        if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
            $avatarPath = $this->handleFileUpload($_FILES['avatar']);
            $set .= ', avatar = :avatar';
            $params['avatar'] = $avatarPath;
        }

        if ($newPassword !== '') {
            if (strlen($newPassword) < 8) Response::validation(['newPassword' => 'New password must be at least 8 characters.']);
            $stmt = $this->db->prepare('SELECT password_hash FROM users WHERE id = :id LIMIT 1');
            $stmt->execute(['id' => $userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$user || !password_verify($currentPassword, $user['password_hash'])) Response::unauthorized('Current password is incorrect.');
            $set .= ', password_hash = :password_hash';
            $params['password_hash'] = password_hash($newPassword, PASSWORD_BCRYPT);
        }

        $stmt = $this->db->prepare("UPDATE users SET $set WHERE id = :id");
        $stmt->execute($params);

        $fresh = $this->db->query("SELECT avatar FROM users WHERE id = $userId")->fetch();

        Response::success([
            'id'    => $userId,
            'name'  => $name,
            'email' => $email,
            'role'  => $payload['role'],
            'avatar' => $fresh['avatar'] ?? null
        ], 'Profile updated successfully.');
    }

    private function handleFileUpload(array $file): string {
        $uploadDir = __DIR__ . '/../../uploads/avatars/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('avatar_', true) . '.' . $ext;
        $targetPath = $uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            return 'uploads/avatars/' . $filename;
        }

        return '';
    }

    private function getJsonBody(): array {
        $body = file_get_contents('php://input');
        $payload = json_decode($body, true);
        return is_array($payload) ? $payload : [];
    }
}
