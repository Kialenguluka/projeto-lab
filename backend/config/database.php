<?php
/**
 * Database — Singleton PDO
 * Suporta MySQL (produção) e SQLite (desenvolvimento)
 */
class Database {
    private static ?Database $instance = null;
    private PDO $pdo;

    private function __construct() {
        $driver = DB_DRIVER ?? 'mysql';

        if ($driver === 'sqlite') {
            $dsn = 'sqlite:' . __DIR__ . '/../database/mini_ecommerce.db';
            $this->pdo = new PDO($dsn);
        } else {
            try {
                $dsn = sprintf(
                    'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                    DB_HOST, DB_PORT, DB_NAME
                );
                $this->pdo = new PDO($dsn, DB_USER, DB_PASS);
            } catch (PDOException $e) {
                // If database doesn't exist, create it
                if ($e->getCode() == 1049) {
                    $dsn = sprintf('mysql:host=%s;port=%s;charset=utf8mb4', DB_HOST, DB_PORT);
                    $pdo = new PDO($dsn, DB_USER, DB_PASS);
                    $pdo->exec("CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                    $pdo = null;
                    
                    // Now connect to the created database
                    $dsn = sprintf(
                        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                        DB_HOST, DB_PORT, DB_NAME
                    );
                    $this->pdo = new PDO($dsn, DB_USER, DB_PASS);
                } else {
                    throw $e;
                }
            }
        }

        $this->pdo->setAttribute(PDO::ATTR_ERRMODE,            PDO::ERRMODE_EXCEPTION);
        $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $this->pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES,   false);

        if ($driver === 'sqlite') {
            $this->pdo->exec('PRAGMA foreign_keys = ON;');
        }
    }

    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection(): PDO {
        return $this->pdo;
    }

    /** Executa query com prepared statement e retorna todos os resultados */
    public function query(string $sql, array $params = []): array {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /** Executa query e retorna apenas a primeira linha */
    public function queryOne(string $sql, array $params = []): ?array {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return $row !== false ? $row : null;
    }

    /** Executa INSERT/UPDATE/DELETE e retorna linhas afectadas */
    public function execute(string $sql, array $params = []): int {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    /** Retorna o último ID inserido */
    public function lastInsertId(): string {
        return $this->pdo->lastInsertId();
    }

    /** Inicia uma transacção */
    public function beginTransaction(): void { $this->pdo->beginTransaction(); }
    public function commit(): void           { $this->pdo->commit(); }
    public function rollback(): void         { $this->pdo->rollBack(); }
}
