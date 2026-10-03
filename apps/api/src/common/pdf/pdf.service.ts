import { Injectable, OnModuleDestroy } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';

/**
 * Renderiza HTML a PDF reutilizando una sola instancia de Chromium para todo
 * el proceso (arrancar el navegador es caro; una página por PDF es barato).
 * Cualquier módulo que necesite un PDF (expediente de comensal, reportes)
 * construye su propio HTML/CSS y llama a render().
 */
@Injectable()
export class PdfService implements OnModuleDestroy {
  private browserPromise: Promise<Browser> | null = null;

  private async getBrowser(): Promise<Browser> {
    if (this.browserPromise === null) {
      const browserPromise = puppeteer
        .launch({
          headless: true,
          args: ['--no-sandbox', '--disable-dev-shm-usage'],
        })
        .then((browser) => {
          browser.on('disconnected', () => {
            // Un navegador anterior no debe invalidar un relanzamiento concurrente.
            if (this.browserPromise === browserPromise)
              this.browserPromise = null;
          });
          return browser;
        })
        .catch((error) => {
          // Un lanzamiento fallido no debe bloquear los siguientes intentos.
          if (this.browserPromise === browserPromise)
            this.browserPromise = null;
          throw error;
        });
      this.browserPromise = browserPromise;
    }
    const browserPromise = this.browserPromise;
    const browser = await browserPromise;
    // La conexión puede haberse perdido antes de registrar el evento.
    if (!browser.connected) {
      if (this.browserPromise === browserPromise) this.browserPromise = null;
      return this.getBrowser();
    }
    return browser;
  }

  async render(
    html: string,
    options?: {
      margin?: { top: string; bottom: string; left: string; right: string };
      /** Letter horizontal — para reportes con tablas anchas (p. ej. la matriz de asistencia). */
      landscape?: boolean;
    },
  ): Promise<Buffer> {
    const browser = await this.getBrowser();
    let page: Page;
    try {
      page = await browser.newPage();
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !/connection closed|disconnected/i.test(error.message)
      ) {
        throw error;
      }
      // Conserva un reemplazo concurrente y reintenta solo una vez al perder la conexión.
      const browserPromise = this.browserPromise;
      if (
        browserPromise !== null &&
        (await browserPromise) === browser &&
        this.browserPromise === browserPromise
      ) {
        this.browserPromise = null;
      }
      page = await (await this.getBrowser()).newPage();
    }
    try {
      await page.setContent(html, { waitUntil: 'load' });
      const pdf = await page.pdf({
        format: 'letter',
        printBackground: true,
        landscape: options?.landscape ?? false,
        margin: options?.margin ?? {
          top: '18mm',
          bottom: '18mm',
          left: '16mm',
          right: '16mm',
        },
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
