<?php
/**
 * AuthMiddleware — Valida JWT em rotas protegidas
 */
class AuthMiddleware {

    /**
     * Requer autenticação válida.
     * Termina com 401 se token ausente/inválido.
     * @return array Payload do JWT (inclui user_id, role, etc.)
     */
    public static function require(): array {
        $payload = self::resolveToken();
        if ($payload === null) {
            Response::unauthorized('Authentication required');
            exit;
        }
        return $payload;
    }

    /**
     * Requer autenticação E perfil de administrador.
     * Termina com 401 ou 403 conforme o caso.
     */
    public static function requireAdmin(): array {
        $payload = self::require();
        if (($payload['role'] ?? '') !== 'admin') {
            Response::forbidden('Admin access required');
            exit;
        }
        return $payload;
    }

    /**
     * Tenta resolver o token sem forçar erro (rotas opcionalmente autenticadas).
     * @return array|null Payload ou null se não autenticado
     */
    public static function optional(): ?array {
        return self::resolveToken();
    }

    // ── Privado ─────────────────────────────────────────────────

    private static function resolveToken(): ?array {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $token = '';

        if (!empty($header) && str_starts_with($header, 'Bearer ')) {
            $token = trim(substr($header, 7));
        } elseif (isset($_GET['token'])) {
            $token = (string) $_GET['token'];
        }

        if (empty($token)) {
            return null;
        }

        try {
            return JWT::validate($token);
        } catch (RuntimeException $e) {
            return null;
        }
    }
}
