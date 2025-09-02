/**
 * Converte o texto do status para um label amigável
 * @param status
 * @returns
 */
export function getStatusLabel(status: string) {
  switch (status) {
    case "in_progress":
      return "Em Progresso";
    case "validation":
      return "Em Validação";
    case "completed":
      return "Concluído";
    default:
      return "Em Progresso";
  }
}

/**
 * Converte o papel do usuário para um label amigável
 * @param role O papel do usuário (admin, clerk, reviewer)
 * @returns
 */
export function getUserRoleLabel(role: string | undefined) {
  switch (role) {
    case "admin":
      return "Administrador";
    case "notifier":
      return "Autor de Notificação";
    case "reviewer":
      return "Revisor";
    default:
      return "Usuário";
  }
}

/**
 * Converte uma string de data no formato ISO (UTC) para o formato de data e hora brasileiro.
 * @param dateString A data em formato de string ISO (ex: "2025-10-23T13:00:00.000Z").
 * @returns A data e hora formatada como "dd/MM/yyyy, HH:mm:ss" (ex: "23/10/2025, 10:00:00")
 * para o fuso de São Paulo, ou uma string vazia se a entrada for inválida.
 */
export function convertDateToPtBr(dateString: string): string {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

/**
 * Pega somente os dígitos de uma string
 * @param str A string de entrada
 */
export function onlyDigits(str: string): string {
  return str.replace(/\D+/g, "");
}

/**
 * Converte uma string de data/hora local para o formato ISO 8601 UTC (com 'Z').
 * A função lida com vários formatos de entrada (YYYY-MM-DD, YYYY-MM-DDTHH:mm, YYYY-MM-DDTHH:mm:ss)
 * e adiciona as partes de tempo e o designador 'Z' conforme necessário para padronizar em UTC.
 *
 * @param {string} input - A string de data/hora local a ser convertida.
 * @returns {string} A string de data/hora no formato ISO 8601 com 'Z', ou a string original se o formato não for reconhecido.
 * @example
 * toIsoZFromLocal("2025-09-01") // retorna "2025-09-01T00:00:00.000Z"
 */
export function toIsoZFromLocal(input: string): string {
  if (!input) return input;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input)) return `${input}:00.000Z`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return `${input}T00:00:00.000Z`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(input))
    return `${input}.000Z`;
  return input;
}

/**
 * Converte uma string de data/hora no formato ISO 8601 (com ou sem 'Z')
 * para o formato 'YYYY-MM-DDTHH:mm', que é compatível com inputs HTML do tipo 'datetime-local'.
 *
 * @param {string | undefined} iso - A string de data/hora ISO a ser convertida.
 * @returns {string} A string de data/hora formatada como 'YYYY-MM-DDTHH:mm', ou uma string vazia se a entrada for inválida.
 * @example
 * fromIsoZToLocalInput("2025-09-01T11:57:30.000Z") // retorna "2025-09-01T11:57"
 */
export function fromIsoZToLocalInput(iso?: string): string {
  if (!iso || typeof iso !== "string") return "";
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(iso)) return iso;
  const trimmed = iso.replace("Z", "");
  const m = trimmed.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
  return m ? m[1] : "";
}

/**
 * Aplica máscara de telefone brasileiro (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 * @param value A string de telefone de entrada
 * @returns A string de telefone formatada com máscara (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function maskPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 10) {
    // (XX) XXXX-XXXX
    return d
      .replace(/^(\d{0,2})(\d{0,4})(\d{0,4}).*/, (_m, a, b, c) =>
        [
          a && `(${a}`,
          a && a.length === 2 ? ")" : "",
          b && ` ${b}`,
          c && `-${c}`,
        ]
          .filter(Boolean)
          .join("")
      )
      .trim();
  }
  // 11 dígitos → (XX) XXXXX-XXXX
  return d
    .replace(/^(\d{0,2})(\d{0,5})(\d{0,4}).*/, (_m, a, b, c) =>
      [a && `(${a}`, a && a.length === 2 ? ")" : "", b && ` ${b}`, c && `-${c}`]
        .filter(Boolean)
        .join("")
    )
    .trim();
}

/**
 * Retorna o primeiro nome de uma pessoa a partir do nome completo fornecido.
 * @param fullName Nome completo da pessoa
 * @returns
 */
export function getPersonFirstName(fullName?: string): string {
  if (!fullName || fullName.trim().length === 0) {
    return "";
  }
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0];

  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
}

export const toLocalInput = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};
