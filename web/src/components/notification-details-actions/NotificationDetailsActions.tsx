import { useAuthStore } from "@/stores/auth/auth.store";

export const NotificationDetailsActions = () => {
  const user = useAuthStore((state) => state.user);
  const isVisible = user?.role === "reviewer" || user?.role === "admin";
  if (!isVisible) {
    return <></>;
  }

  return <> Botoes de ação Aprovar Notificação | Voltar para Edição</>;
};
