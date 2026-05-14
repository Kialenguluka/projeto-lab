<?php
/**
 * index.php — Router central do Mini E-commerce API
 *
 * Todos os pedidos são redirecionados aqui via .htaccess
 * URI esperada: /api/{recurso}/{id}
 */

declare(strict_types=1);

// ── Autoload das classes ────────────────────────────────────────
require_once __DIR__ . '/config/constants.php';

error_reporting(E_ALL);
ini_set('display_errors', APP_ENV === 'development' ? '1' : '0');
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/utils/JWT.php';
require_once __DIR__ . '/utils/Export.php';
require_once __DIR__ . '/middleware/CorsMiddleware.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';
require_once __DIR__ . '/controllers/PingController.php';

// ── CORS (sempre primeiro) ──────────────────────────────────────
CorsMiddleware::handle();

// ── Parse da URI ────────────────────────────────────────────────
$requestUri    = $_SERVER['REQUEST_URI'] ?? '/';
$requestMethod = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

// Remover query string e prefixo /api
$path = parse_url($requestUri, PHP_URL_PATH);
$path = preg_replace('#^' . API_PREFIX . '#', '', $path);
$path = '/' . trim($path, '/');

// Segmentos: /users/42 → ['users', '42']
$segments = array_filter(explode('/', $path));
$segments = array_values($segments);

$resource = $segments[0] ?? '';
$sub1     = $segments[1] ?? null;
$sub2     = $segments[2] ?? null;
$sub3     = $segments[3] ?? null;

// ── Roteamento ──────────────────────────────────────────────────

try {
    switch ($resource) {

        // ── Health check ──────────────────────────────────────
        case 'ping':
            if ($requestMethod === 'GET') {
                PingController::ping();
            }
            break;

        // ── Auth ──────────────────────────────────────────────
        case 'auth':
            require_once __DIR__ . '/controllers/AuthController.php';
            $controller = new AuthController();
            match([$requestMethod, $sub1]) {
                ['POST', 'register']       => $controller->register(),
                ['POST', 'login']          => $controller->login(),
                ['POST', 'logout']         => $controller->logout(),
                ['POST', 'forgot-password']=> $controller->forgotPassword(),
                ['POST', 'reset-password'] => $controller->resetPassword(),
                ['GET',  'me']             => $controller->me(),
                ['POST', 'me']             => $controller->updateMe(),
                ['PUT',  'me']             => $controller->updateMe(),

                default                    => Response::notFound("Auth route not found: $sub1")
            };
            break;

        // ── Products ──────────────────────────────────────────
        case 'products':
            require_once __DIR__ . '/controllers/ProductController.php';
            $controller = new ProductController();
            if ($sub1 === null && $requestMethod === 'GET') {
                $controller->index();
                break;
            }
            if ($sub1 !== null && $requestMethod === 'GET') {
                $controller->show((int) $sub1);
                break;
            }
            if ($sub1 === null && $requestMethod === 'POST') {
                $controller->store();
                break;
            }
            if ($sub1 !== null && in_array($requestMethod, ['PUT', 'PATCH'], true)) {
                $controller->update((int) $sub1);
                break;
            }
            if ($sub1 !== null && $requestMethod === 'DELETE') {
                $controller->destroy((int) $sub1);
                break;
            }
            Response::notFound('Products route not found.');
            break;

        // ── Categories ────────────────────────────────────────
        case 'categories':
            require_once __DIR__ . '/controllers/CategoryController.php';
            $controller = new CategoryController();
            if ($sub1 === null && $requestMethod === 'GET') {
                $controller->index();
                break;
            }
            if ($sub1 !== null && $requestMethod === 'GET') {
                $controller->show((int) $sub1);
                break;
            }
            if ($sub1 === null && $requestMethod === 'POST') {
                $controller->store();
                break;
            }
            if ($sub1 !== null && in_array($requestMethod, ['PUT', 'PATCH'], true)) {
                $controller->update((int) $sub1);
                break;
            }
            if ($sub1 !== null && $requestMethod === 'DELETE') {
                $controller->destroy((int) $sub1);
                break;
            }
            Response::notFound('Categories route not found.');
            break;

        // ── Cart ──────────────────────────────────────────────
        case 'cart':
            require_once __DIR__ . '/controllers/CartController.php';
            $controller = new CartController();
            if ($sub1 === 'items') {
                if ($sub2 === null && $requestMethod === 'POST') {
                    $controller->addItem();
                    break;
                }
                if ($sub2 !== null && $requestMethod === 'PUT') {
                    $controller->updateItem((int) $sub2);
                    break;
                }
                if ($sub2 !== null && $requestMethod === 'DELETE') {
                    $controller->removeItem((int) $sub2);
                    break;
                }
                Response::notFound('Cart items route not found.');
                break;
            }
            if ($sub1 === 'checkout' && $requestMethod === 'POST') {
                $controller->checkout();
                break;
            }
            if ($sub1 === null && $requestMethod === 'GET') {
                $controller->index();
                break;
            }
            Response::notFound('Cart route not found.');
            break;

        // ── Addresses ──────────────────────────────────────────
        case 'addresses':
            require_once __DIR__ . '/controllers/AddressController.php';
            $controller = new AddressController();
            if ($sub1 === null && $requestMethod === 'GET') {
                $controller->index();
                break;
            }
            if ($sub1 === null && $requestMethod === 'POST') {
                $controller->store();
                break;
            }
            if ($sub1 !== null && $requestMethod === 'PUT') {
                $controller->update((int) $sub1);
                break;
            }
            if ($sub1 !== null && $requestMethod === 'DELETE') {
                $controller->destroy((int) $sub1);
                break;
            }
            Response::notFound('Addresses route not found.');
            break;

        // ── Orders ────────────────────────────────────────────
        case 'orders':
            require_once __DIR__ . '/controllers/OrderController.php';
            $controller = new OrderController();
            if ($sub1 === null && $requestMethod === 'GET') {
                $controller->index();
                break;
            }
            if ($sub1 === null && $requestMethod === 'POST') {
                $controller->store();
                break;
            }
            if ($sub1 !== null && $sub2 === 'export' && $requestMethod === 'GET') {
                $controller->export((int) $sub1);
                break;
            }
            if ($sub1 !== null && $requestMethod === 'GET') {
                $controller->show((int) $sub1);
                break;
            }
            if ($sub1 !== null && in_array($requestMethod, ['PUT', 'PATCH'], true) && $sub2 === 'status') {
                $controller->updateStatus((int) $sub1);
                break;
            }
            Response::notFound('Orders route not found.');
            break;

        // ── Users (admin) ─────────────────────────────────────
        case 'users':
            require_once __DIR__ . '/controllers/UserController.php';
            $controller = new UserController();
            if ($sub1 === null && $requestMethod === 'GET') {
                $controller->index();
                break;
            }
            if ($sub1 !== null && $requestMethod === 'GET') {
                $controller->show((int) $sub1);
                break;
            }
            if ($sub1 !== null && $requestMethod === 'PUT') {
                $controller->update((int) $sub1);
                break;
            }
            if ($sub1 !== null && $requestMethod === 'DELETE') {
                $controller->destroy((int) $sub1);
                break;
            }
            Response::notFound('Users route not found.');
            break;

        // ── Export ────────────────────────────────────────────
        case 'export':
            require_once __DIR__ . '/controllers/ExportController.php';
            $controller = new ExportController();
            if ($requestMethod === 'GET') {
                $controller->report();
                break;
            }
            Response::notFound('Export route not found.');
            break;

        case 'admin':
            $adminResource = $sub1;
            if ($adminResource === 'products') {
                require_once __DIR__ . '/controllers/ProductController.php';
                $controller = new ProductController();
                if ($sub2 === null && $requestMethod === 'GET') {
                    $controller->adminIndex();
                    break;
                }
                if ($sub2 === null && $requestMethod === 'POST') {
                    $controller->store();
                    break;
                }
                if ($sub2 !== null && $requestMethod === 'GET') {
                    $controller->show((int) $sub2);
                    break;
                }
                if ($sub2 !== null && in_array($requestMethod, ['PUT', 'PATCH'], true)) {
                    $controller->update((int) $sub2);
                    break;
                }
                if ($sub2 !== null && $requestMethod === 'DELETE') {
                    $controller->destroy((int) $sub2);
                    break;
                }
            }

            if ($adminResource === 'categories') {
                require_once __DIR__ . '/controllers/CategoryController.php';
                $controller = new CategoryController();
                if ($sub2 === null && $requestMethod === 'GET') {
                    $controller->adminIndex();
                    break;
                }
                if ($sub2 === null && $requestMethod === 'POST') {
                    $controller->store();
                    break;
                }
                if ($sub2 !== null && $requestMethod === 'GET') {
                    $controller->show((int) $sub2);
                    break;
                }
                if ($sub2 !== null && in_array($requestMethod, ['PUT', 'PATCH'], true)) {
                    $controller->update((int) $sub2);
                    break;
                }
                if ($sub2 !== null && $requestMethod === 'DELETE') {
                    $controller->destroy((int) $sub2);
                    break;
                }
            }

            if ($adminResource === 'orders') {
                require_once __DIR__ . '/controllers/OrderController.php';
                $controller = new OrderController();
                if ($sub2 === null && $requestMethod === 'GET') {
                    $controller->index();
                    break;
                }
                if ($sub2 !== null && in_array($requestMethod, ['PUT', 'PATCH'], true) && $sub3 === 'status') {
                    $controller->updateStatus((int) $sub2);
                    break;
                }
            }

            if ($adminResource === 'users') {
                require_once __DIR__ . '/controllers/UserController.php';
                $controller = new UserController();
                if ($sub2 === null && $requestMethod === 'GET') {
                    $controller->index();
                    break;
                }
                if ($sub2 !== null && $requestMethod === 'GET') {
                    $controller->show((int) $sub2);
                    break;
                }
                if ($sub2 !== null && $requestMethod === 'PUT') {
                    $controller->update((int) $sub2);
                    break;
                }
                if ($sub2 !== null && $requestMethod === 'DELETE') {
                    $controller->destroy((int) $sub2);
                    break;
                }
            }

            if ($adminResource === 'reports' && $sub2 === 'export' && $requestMethod === 'GET') {
                require_once __DIR__ . '/controllers/ExportController.php';
                $controller = new ExportController();
                $controller->report();
                break;
            }

            if ($adminResource === 'stats' && $requestMethod === 'GET') {
                require_once __DIR__ . '/controllers/StatsController.php';
                $controller = new StatsController();
                $controller->dashboard();
                break;
            }

            Response::notFound('Admin route not found.');
            break;

        // ── Upload ────────────────────────────────────────────
        case 'upload':
            require_once __DIR__ . '/controllers/UploadController.php';
            $controller = new UploadController();
            if ($requestMethod === 'POST') {
                $controller->upload();
                break;
            }
            Response::notFound('Upload route not found.');
            break;

        // ── Rota não encontrada ───────────────────────────────
        default:
            Response::notFound("API route not found: /$resource");
    }

} catch (PDOException $e) {
    error_log('[DB] ' . $e->getMessage());
    Response::serverError(APP_ENV === 'development' ? $e->getMessage() : 'Database error');
} catch (Throwable $e) {
    error_log('[APP] ' . $e->getMessage());
    Response::serverError(APP_ENV === 'development' ? $e->getMessage() : 'Unexpected error');
}
