/**
 * `qrcode-generator` ships no types of its own, and the community package
 * (`@types/qrcode-generator`) only declares the tag-string helpers
 * (`createSvgTag`, `createImageTag`, ...) - not `getModuleCount`/`isDark`,
 * which the library does export and which `lib/qr.ts` needs to draw the
 * matrix as our own inline SVG rather than trust the library's own markup.
 * Declared here instead, matching what the runtime actually exposes.
 */
declare module "qrcode-generator" {
  export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

  export interface QRCode {
    addData(data: string): void;
    make(): void;
    /** The QR is always square - this is both its width and height, in modules. */
    getModuleCount(): number;
    isDark(row: number, col: number): boolean;
  }

  function qrcode(typeNumber: number, errorCorrectionLevel: ErrorCorrectionLevel): QRCode;

  export = qrcode;
}
