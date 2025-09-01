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
 * Converte uma string de data no formato ISO para o formato de data brasileiro (dd/MM/yyyy).
 * @param dateString A data em formato de string (ex: "2025-08-31T01:49:44.958Z").
 * @returns A data formatada como "dd/MM/yyyy" ou uma string vazia se a entrada for inválida.
 */
export function convertDateToPtBr(dateString: string): string {
  if (!dateString) {
    return "";
  }
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
}

/**
 * Pega somente os dígitos de uma string
 * @param str A string de entrada
 */
export function onlyDigits(str: string): string {
  return str.replace(/\D+/g, "");
}

export function toIsoZFromLocal(input: string): string {
  if (!input) return input;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input)) return `${input}:00.000Z`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return `${input}T00:00:00.000Z`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(input))
    return `${input}.000Z`;
  return input;
}

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

export function getPersonFirstName(fullName?: string): string {
  if (!fullName || fullName.trim().length === 0) {
    return "";
  }
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0];

  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
}
