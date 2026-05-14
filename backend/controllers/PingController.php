<?php
/**
 * PingController — Health check endpoint
 * GET /api/ping
 */
class PingController {

    public static function ping(): void {
        Response::success([
            'status'    => 'ok',
            'version'   => APP_VERSION,
            'timestamp' => date('c'),
            'env'       => APP_ENV,
        ], 'pong');
    }
}
