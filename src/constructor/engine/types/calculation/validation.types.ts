export type ValidationMessage = {
  type: "error" | "warning";

  /**
   * Код ошибки.
   * Например: INVALID_WIDTH, SECTION_TOO_WIDE.
   */
  code: string;

  /**
   * Текст ошибки для пользователя.
   */
  message: string;
};
