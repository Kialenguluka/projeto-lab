<?php
/**
 * UploadController — Gerenciamento de upload de arquivos
 */

class UploadController {

    public function upload(): void {
        AuthMiddleware::requireAdmin();

        if (!isset($_FILES['file'])) {
            Response::validation(['file' => 'Nenhum arquivo enviado.']);
        }

        $file = $_FILES['file'];
        $fileName = $file['name'];
        $fileTmpName = $file['tmp_name'];
        $fileSize = $file['size'];
        $fileError = $file['error'];
        $fileType = $file['type'];

        if ($fileError !== 0) {
            Response::serverError('Erro ao fazer upload do arquivo.');
        }

        $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

        if (!in_array($fileExt, $allowed)) {
            Response::validation(['file' => 'Extensão de arquivo não permitida. Apenas imagens são aceitas (jpg, jpeg, png, gif, webp).']);
        }

        if ($fileSize > 5000000) { // 5MB limit
            Response::validation(['file' => 'O arquivo é muito grande. O limite é 5MB.']);
        }

        $uploadDir = __DIR__ . '/../uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $newFileName = uniqid('', true) . '.' . $fileExt;
        $fileDestination = $uploadDir . $newFileName;

        if (move_uploaded_file($fileTmpName, $fileDestination)) {
            $url = 'http://localhost:8000/uploads/' . $newFileName;
            Response::success(['url' => $url], 'Upload realizado com sucesso.');
        } else {
            Response::serverError('Erro ao mover o arquivo para o destino final.');
        }
    }
}
