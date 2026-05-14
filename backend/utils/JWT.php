<?php
/**
 * JWT — Implementação manual de HS256 (sem bibliotecas externas)
 *
 * Referência: https://jwt.io/introduction
 */
class JWT {

    // ── Geração ─────────────────────────────────────────────────

    /**
     * Gera um token JWT assinado com HS256
     * @param array $payload Dados a incluir no token
     * @param int   $ttl     Tempo de vida em segundos (usa JWT_EXPIRY por defeito)
     */
    public static function generate(array $payload, int $ttl = 0): string {
        $ttl = $ttl > 0 ? $ttl : JWT_EXPIRY;
        $now = time();

        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT',
        ];

        $claims = array_merge($payload, [
            'iat' => $now,
            'nbf' => $now,
            'exp' => $now + $ttl,
        ]);

        $headerB64  = self::base64UrlEncode(json_encode($header));
        $payloadB64 = self::base64UrlEncode(json_encode($claims));
        $signature  = self::sign("$headerB64.$payloadB64");

        return "$headerB64.$payloadB64.$signature";
    }

    // ── Validação ───────────────────────────────────────────────

    /**
     * Valida e decodifica um token JWT
     * @param string $token Token a validar
     * @return array        Payload decodificado
     * @throws RuntimeException em caso de token inválido ou expirado
     */
    public static function validate(string $token): array {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            throw new RuntimeException('Invalid token structure');
        }

        [$headerB64, $payloadB64, $signature] = $parts;

        // Verificar assinatura
        $expected = self::sign("$headerB64.$payloadB64");
        if (!hash_equals($expected, $signature)) {
            throw new RuntimeException('Invalid token signature');
        }

        // Decodificar payload
        $payload = json_decode(self::base64UrlDecode($payloadB64), true);
        if (!is_array($payload)) {
            throw new RuntimeException('Invalid token payload');
        }

        // Verificar expiração
        if (isset($payload['exp']) && time() > $payload['exp']) {
            throw new RuntimeException('Token has expired');
        }

        // Verificar not-before
        if (isset($payload['nbf']) && time() < $payload['nbf']) {
            throw new RuntimeException('Token not yet valid');
        }

        return $payload;
    }

    /**
     * Extrai o payload sem validar a assinatura (usar apenas para debug)
     */
    public static function decode(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;
        $payload = json_decode(self::base64UrlDecode($parts[1]), true);
        return is_array($payload) ? $payload : null;
    }

    // ── Privado ─────────────────────────────────────────────────

    private static function sign(string $data): string {
        $hash = hash_hmac('sha256', $data, JWT_SECRET, true);
        return self::base64UrlEncode($hash);
    }

    private static function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string {
        $remainder = strlen($data) % 4;
        if ($remainder > 0) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
