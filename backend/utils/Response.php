<?php
/**
 * Response — Helper estático para respostas JSON uniformes
 */
class Response {

    /**
     * Resposta de sucesso
     * @param mixed  $data    Dados a retornar
     * @param string $message Mensagem opcional
     * @param int    $code    Código HTTP (200 por defeito)
     */
    public static function success($data = null, string $message = 'Success', int $code = 200): void {
        self::send([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $code);
    }

    /**
     * Resposta de erro
     * @param string $message Mensagem de erro
     * @param int    $code    Código HTTP (400 por defeito)
     * @param array  $errors  Erros de validação detalhados (opcional)
     */
    public static function error(string $message = 'Error', int $code = 400, array $errors = []): void {
        $body = [
            'success' => false,
            'message' => $message,
        ];
        if (!empty($errors)) {
            $body['errors'] = $errors;
        }
        self::send($body, $code);
    }

    /** 401 Unauthorized */
    public static function unauthorized(string $message = 'Unauthorized'): void {
        self::error($message, 401);
    }

    /** 403 Forbidden */
    public static function forbidden(string $message = 'Forbidden'): void {
        self::error($message, 403);
    }

    /** 404 Not Found */
    public static function notFound(string $message = 'Resource not found'): void {
        self::error($message, 404);
    }

    /** 422 Unprocessable Entity (erros de validação) */
    public static function validation(array $errors, string $message = 'Validation failed'): void {
        self::error($message, 422, $errors);
    }

    /** 500 Internal Server Error */
    public static function serverError(string $message = 'Internal server error'): void {
        self::error($message, 500);
    }

    // ── Helpers privados ────────────────────────────────────────

    private static function send(array $body, int $code): void {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
}
