import { Injectable } from '@angular/core';

export interface PdfOrder {
  id: string;
  productName: string;
  items: number;
  total: number;
  status: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  exportOrderPdf(order: PdfOrder): void {
    const lines = [
      'MiniShop - Encomenda',
      `Numero: ${order.id}`,
      `Produto: ${order.productName}`,
      `Itens: ${order.items}`,
      `Total: AOA ${order.total}`,
      `Estado: ${order.status}`,
      `Criada em: ${order.createdAt}`,
    ];
    const pdf = this.makeSimplePdf(lines);
    const blob = new Blob([pdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${order.id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private makeSimplePdf(lines: string[]): string {
    const escaped = lines.map((line) => line.replace(/[()\\]/g, '\\$&'));
    const content = [
      'BT',
      '/F1 16 Tf',
      '50 780 Td',
      ...escaped.flatMap((line, index) => [
        index === 0 ? '' : '0 -28 Td',
        `(${line}) Tj`,
      ]),
      'ET',
    ].filter(Boolean).join('\n');

    const objects = [
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
      '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
      `5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`,
    ];

    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    for (const object of objects) {
      offsets.push(pdf.length);
      pdf += `${object}\n`;
    }
    const xref = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const offset of offsets.slice(1)) {
      pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return pdf;
  }
}
