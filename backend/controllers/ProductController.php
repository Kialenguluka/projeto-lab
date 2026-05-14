<?php
/**
 * ProductController — CRUD de produtos e listagem pública
 */

class ProductController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index(): void {
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $limit = min(MAX_PAGE_SIZE, max(1, (int) ($_GET['limit'] ?? DEFAULT_PAGE_SIZE)));
        $offset = ($page - 1) * $limit;
        $params = [];
        $where = ['p.active = 1'];

        $category = trim((string) ($_GET['category'] ?? ''));
        if ($category !== '') {
            if (ctype_digit($category)) {
                $where[] = 'p.category_id = :category_id';
                $params['category_id'] = (int) $category;
            } else {
                $where[] = 'c.slug = :category_slug';
                $params['category_slug'] = $category;
            }
        }

        $search = trim((string) ($_GET['search'] ?? ''));
        if ($search !== '') {
            $where[] = '(p.name_pt LIKE :search OR p.name_en LIKE :search OR p.description_pt LIKE :search OR p.description_en LIKE :search)';
            $params['search'] = '%' . $search . '%';
        }

        $filterSql = implode(' AND ', $where);

        $totalSql = "SELECT COUNT(*) FROM products p JOIN categories c ON p.category_id = c.id WHERE $filterSql";
        $stmt = $this->db->prepare($totalSql);
        $stmt->execute($params);
        $total = (int) $stmt->fetchColumn();

        $sql = "SELECT p.id, p.category_id, p.name_pt, p.name_en, p.description_pt, p.description_en, p.price, p.stock, p.image_url, p.active, p.created_at, c.slug AS category_slug, c.name_pt AS category_name
                FROM products p
                JOIN categories c ON p.category_id = c.id
                WHERE $filterSql
                ORDER BY p.created_at DESC
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue(':' . $key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::success([
            'items' => $products,
            'page' => $page,
            'pageSize' => $limit,
            'total' => $total,
            'totalPages' => (int) ceil($total / $limit),
        ], 'Products retrieved successfully');
    }

    public function adminIndex(): void {
        AuthMiddleware::requireAdmin();
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $limit = min(MAX_PAGE_SIZE, max(1, (int) ($_GET['limit'] ?? DEFAULT_PAGE_SIZE)));
        $offset = ($page - 1) * $limit;
        $params = [];
        $where = ['1 = 1'];

        $category = trim((string) ($_GET['category'] ?? ''));
        if ($category !== '') {
            if (ctype_digit($category)) {
                $where[] = 'p.category_id = :category_id';
                $params['category_id'] = (int) $category;
            } else {
                $where[] = 'c.slug = :category_slug';
                $params['category_slug'] = $category;
            }
        }

        $search = trim((string) ($_GET['search'] ?? ''));
        if ($search !== '') {
            $where[] = '(p.name_pt LIKE :search OR p.name_en LIKE :search OR p.description_pt LIKE :search OR p.description_en LIKE :search)';
            $params['search'] = '%' . $search . '%';
        }

        $filterSql = implode(' AND ', $where);

        $totalSql = "SELECT COUNT(*) FROM products p JOIN categories c ON p.category_id = c.id WHERE $filterSql";
        $stmt = $this->db->prepare($totalSql);
        $stmt->execute($params);
        $total = (int) $stmt->fetchColumn();

        $sql = "SELECT p.id, p.category_id, p.name_pt, p.name_en, p.description_pt, p.description_en, p.price, p.stock, p.image_url, p.active, p.created_at, c.slug AS category_slug, c.name_pt AS category_name
                FROM products p
                JOIN categories c ON p.category_id = c.id
                WHERE $filterSql
                ORDER BY p.created_at DESC
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue(':' . $key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::success([
            'items' => $products,
            'page' => $page,
            'pageSize' => $limit,
            'total' => $total,
            'totalPages' => (int) ceil($total / $limit),
        ], 'Products retrieved successfully');
    }

    public function show(int $id): void {
        $payload = AuthMiddleware::optional();
        $sql = 'SELECT p.id, p.category_id, p.name_pt, p.name_en, p.description_pt, p.description_en, p.price, p.stock, p.image_url, p.active, p.created_at, c.slug AS category_slug, c.name_pt AS category_name
             FROM products p
             JOIN categories c ON p.category_id = c.id
             WHERE p.id = :id';

        if (($payload['role'] ?? '') !== 'admin') {
            $sql .= ' AND p.active = 1';
        }

        $sql .= ' LIMIT 1';
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            Response::notFound('Product not found.');
        }

        Response::success(['product' => $product], 'Product retrieved successfully');
    }

    public function store(): void {
        AuthMiddleware::requireAdmin();
        $payload = $this->getJsonBody();
        $data = $this->validatePayload($payload);

        $stmt = $this->db->prepare(
            'INSERT INTO products (category_id, name_pt, name_en, description_pt, description_en, price, stock, image_url, active)
             VALUES (:category_id, :name_pt, :name_en, :description_pt, :description_en, :price, :stock, :image_url, :active)'
        );
        $stmt->execute($data);
        $productId = (int) $this->db->lastInsertId();
        Response::success(['id' => $productId] + $data, 'Product created successfully', 201);
    }

    public function update(int $id): void {
        AuthMiddleware::requireAdmin();
        $payload = $this->getJsonBody();
        $data = $this->validatePayload($payload, false);
        $data['id'] = $id;

        $stmt = $this->db->prepare(
            'UPDATE products SET category_id = :category_id, name_pt = :name_pt, name_en = :name_en,
             description_pt = :description_pt, description_en = :description_en,
             price = :price, stock = :stock, image_url = :image_url, active = :active
             WHERE id = :id'
        );
        $stmt->execute($data);

        if ($stmt->rowCount() === 0) {
            Response::notFound('Product not found or nothing to update.');
        }

        Response::success(['id' => $id] + $data, 'Product updated successfully');
    }

    public function destroy(int $id): void {
        AuthMiddleware::requireAdmin();
        $stmt = $this->db->prepare('DELETE FROM products WHERE id = :id');
        $stmt->execute(['id' => $id]);

        if ($stmt->rowCount() === 0) {
            Response::notFound('Product not found.');
        }

        Response::success(null, 'Product removed successfully');
    }

    private function validatePayload(array $payload, bool $required = true): array {
        $errors = [];
        $categoryId = isset($payload['categoryId']) ? (int) $payload['categoryId'] : 0;
        $namePt = trim((string) ($payload['namePt'] ?? ''));
        $nameEn = trim((string) ($payload['nameEn'] ?? ''));
        $descriptionPt = trim((string) ($payload['descriptionPt'] ?? ''));
        $descriptionEn = trim((string) ($payload['descriptionEn'] ?? ''));
        $price = isset($payload['price']) ? (float) $payload['price'] : null;
        $stock = isset($payload['stock']) ? (int) $payload['stock'] : null;
        $imageUrl = trim((string) ($payload['imageUrl'] ?? ''));
        $active = isset($payload['active']) ? (int) $payload['active'] : 1;

        if ($required && $categoryId <= 0) {
            $errors['categoryId'] = 'Category is required.';
        }

        if ($namePt === '') {
            $errors['namePt'] = 'Portuguese name is required.';
        }

        if ($nameEn === '') {
            $errors['nameEn'] = 'English name is required.';
        }

        if ($price === null || $price < 0) {
            $errors['price'] = 'Price must be a non-negative number.';
        }

        if ($stock === null || $stock < 0) {
            $errors['stock'] = 'Stock must be a non-negative integer.';
        }

        if (!empty($errors)) {
            Response::validation($errors);
        }

        return [
            'category_id' => $categoryId,
            'name_pt' => $namePt,
            'name_en' => $nameEn,
            'description_pt' => $descriptionPt,
            'description_en' => $descriptionEn,
            'price' => $price,
            'stock' => $stock,
            'image_url' => $imageUrl,
            'active' => $active,
        ];
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
