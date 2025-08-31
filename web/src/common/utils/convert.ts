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
