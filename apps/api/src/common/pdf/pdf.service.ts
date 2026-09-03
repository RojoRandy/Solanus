import { Injectable, OnModuleDestroy } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';

/**
 * Renderiza HTML a PDF reutilizando una sola instancia de Chromium para todo
 * el proceso (arrancar el navegador es caro; una página por PDF es barato).
 * Cualquier módulo que necesite un PDF (expediente de comensal, reportes)
 * construye su propio HTML/CSS y llama a render().
 */
@Injectable()
export class PdfService implements OnModuleDestroy {
  private browserPromise: Promise<Browser> | null = null;

  private getBrowser(): Promise<Browser> {
    if (this.browserPromise === null) {
      this.browserPromise = puppeteer.launch({
        headless: true,
        args: ['--no-sandbox'],
      });
    }
    return this.browserPromise;
  }

  async render(
    html: string,
    options?: { margin?: { top: string; bottom: string; left: string; right: string } },
  ): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'load' });
      const pdf = await page.pdf({
        format: 'letter',
        printBackground: true,
        margin: options?.margin ?? { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' },
      });
      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }

  async onModuleDestroy() {
    if (this.browserPromise !== null) {
      const browser = await this.browserPromise;
      await browser.close();
    }
  }
}
