<?php
/**
 * Export — utilitário para gerar CSV/PDF
 */
class Export {
    public static function csv(array $rows, array $headers, string $filename): void {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=' . basename($filename) . '.csv');
        $out = fopen('php://output', 'w');
        fputcsv($out, $headers);
        foreach ($rows as $row) {
            fputcsv($out, $row);
        }
        fclose($out);
        exit;
    }

    public static function pdf(string $html, string $filename): void {
        header('Content-Type: text/html; charset=utf-8');
        // Add a print trigger
        $printScript = '<script>window.onload = function() { window.print(); }</script>';
        echo $html . $printScript;
        exit;
    }
}
