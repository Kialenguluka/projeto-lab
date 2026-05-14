<?php
/**
 * CategoryController — CRUD de categorias e listagem pública
 */

class CategoryController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index(): void {
        $stmt = $this->db->query(
            'SELECT id, name_pt, name_en, slug, active, created_at FROM categories WHERE active = 1 ORDER BY name_en ASC'
        );
        Response::success(['items' => $stmt->fetchAll(PDO::FETCH_ASSOC)], 'Categories retrieved successfully');
    }

    public function adminIndex(): void {
        AuthMiddleware::requireAdmin();
        $stmt = $this->db->query(
            'SELECT id, name_pt, name_en, slug, active, created_at FROM categories ORDER BY name_en ASC'
        );
        Response::success(['items' => $stmt->fetchAll(PDO::FETCH_ASSOC)], 'Categories retrieved successfully');
    }

    public function show(int $id): void {
        $payload = AuthMiddleware::optional();
        $sql = 'SELECT id, name_pt, name_en, slug, active, created_at FROM categories WHERE id = :id';

        if (($payload['role'] ?? '') !== 'admin') {
            $sql .= ' AND active = 1';
        }

        $sql .= ' LIMIT 1';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $category = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$category) {
            Response::notFound('Category not found.');
        }

        Response::success(['category' => $category], 'Category retrieved successfully');
    }

    public function store(): void {
        AuthMiddleware::requireAdmin();
        $payload = $this->getJsonBody();
        $data = $this->validatePayload($payload);

        $stmt = $this->db->prepare(
            'INSERT INTO categories (name_pt, name_en, slug, active) VALUES (:name_pt, :name_en, :slug, :active)'
        );
        $stmt->execute($data);
        $categoryId = (int) $this->db->lastInsertId();

        Response::success(['id' => $categoryId] + $data, 'Category created successfully', 201);
    }

    public function update(int $id): void {
        AuthMiddleware::requireAdmin();
        $payload = $this->getJsonBody();
        $data = $this->validatePayload($payload, false);
        $data['id'] = $id;

        $stmt = $this->db->prepare(
            'UPDATE categories SET name_pt = :name_pt, name_en = :name_en, slug = :slug, active = :active WHERE id = :id'
        );
        $stmt->execute($data);

        if ($stmt->rowCount() === 0) {
            Response::notFound('Category not found or nothing to update.');
        }

        Response::success(['id' => $id] + $data, 'Category updated successfully');
    }

    public function destroy(int $id): void {
        AuthMiddleware::requireAdmin();
        $stmt = $this->db->prepare('DELETE FROM categories WHERE id = :id');
        $stmt->execute(['id' => $id]);

        if ($stmt->rowCount() === 0) {
            Response::notFound('Category not found.');
        }

        Response::success(null, 'Category removed successfully');
    }

    private function validatePayload(array $payload, bool $required = true): array {
        $errors = [];
        $namePt = trim((string) ($payload['namePt'] ?? ''));
        $nameEn = trim((string) ($payload['nameEn'] ?? ''));
        $active = isset($payload['active']) ? (int) $payload['active'] : 1;

        if ($required && $namePt === '') {
            $errors['namePt'] = 'Portuguese name is required.';
        }

        if ($required && $nameEn === '') {
            $errors['nameEn'] = 'English name is required.';
        }

        if (!empty($errors)) {
            Response::validation($errors);
        }

        return [
            'name_pt' => $namePt,
            'name_en' => $nameEn,
            'slug' => $this->slugify($nameEn ?: $namePt),
            'active' => $active,
        ];
    }

    private function slugify(string $text): string {
        $text = preg_replace('~[^\\pL\d]+~u', '-', $text);
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
        $text = preg_replace('~[^-\w]+~', '', $text);
        $text = trim($text, '-');
        $text = preg_replace('~-+~', '-', $text);
        return strtolower($text ?: 'category');
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
