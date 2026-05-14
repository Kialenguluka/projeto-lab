<?php
/**
 * CorsMiddleware — Headers CORS para comunicação com Angular
 */
class CorsMiddleware {

    public static function handle(): void {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // Em desenvolvimento aceita a origem do Angular; em produção validar a lista
        $allowedOrigins = defined('CORS_ORIGIN')
            ? explode(',', CORS_ORIGIN)
            : ['http://localhost:4200'];

        if (in_array($origin, $allowedOrigins, true) || APP_ENV === 'development') {
            header("Access-Control-Allow-Origin: $origin");
        }

        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: ' . CORS_METHODS);
        header('Access-Control-Allow-Headers: ' . CORS_HEADERS);
        header('Access-Control-Max-Age: 86400'); // Cache pre-flight 24h

        // Responder imediatamente ao pre-flight OPTIONS
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
