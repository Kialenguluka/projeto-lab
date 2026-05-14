<?php
require_once __DIR__ . '/config/constants.php';
require_once __DIR__ . '/config/database.php';

$db = Database::getInstance()->getConnection();

$sql = file_get_contents(__DIR__ . '/database/schema.sql');

// Remove MySQL database creation and USE statements when executing through PDO
$sql = preg_replace('/^CREATE DATABASE[\s\S]*?;[\r\n]*/im', '', $sql);
$sql = preg_replace('/^USE\s+[^;]+;[\r\n]*/im', '', $sql);

// Split into statements
$statements = array_filter(array_map('trim', explode(';', $sql)));


foreach ($statements as $statement) {
    if (!empty($statement)) {
        try {
            $db->exec($statement);
            echo "Executed: " . substr($statement, 0, 50) . "...\n";
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage() . "\n";
        }
    }
}

echo "Schema executed.\n";
?>