// Error de regla de negocio. El mensaje se enseña tal cual al usuario.
export type DomainErrorCode =
  | "not_found"
  | "validation"
  | "media_limit"
  | "file_too_large"
  | "file_type"
  | "invalid_price_drop"
  | "module_disabled"
  | "forbidden";

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}
