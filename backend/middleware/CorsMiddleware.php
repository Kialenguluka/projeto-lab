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

        // If no origin provided (CLI requests), in development allow all origins with '*'
        if (APP_ENV === 'development') {
            $allowOrigin = $origin !== '' ? $origin : '*';
        } else {
            $allowOrigin = in_array($origin, $allowedOrigins, true) ? $origin : ($allowedOrigins[0] ?? '');
        }

        if ($allowOrigin !== '') {
            header("Access-Control-Allow-Origin: $allowOrigin");
        }

        header_remove('Connection');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: ' . CORS_METHODS);
        header('Access-Control-Allow-Headers: ' . CORS_HEADERS);
        header('Access-Control-Expose-Headers: Content-Type, Authorization, X-Requested-With, Connection, Keep-Alive');
        header('Access-Control-Max-Age: 86400'); // Cache pre-flight 24h
        header('Connection: keep-alive');
        header('Keep-Alive: timeout=10, max=100');

        // Responder imediatamente ao pre-flight OPTIONS
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
