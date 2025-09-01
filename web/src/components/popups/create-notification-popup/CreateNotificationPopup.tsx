import { CreateNotification } from "@/components/create-notification/CreateNotification";
import { BasePopup } from "../base-popup/BasePopup";

interface CreateNotificationPopupProps {
  openCreatePopup: boolean;
  setOpenCreatePopup: (open: boolean) => void;
}

export const CreateNotificationPopup = ({
  openCreatePopup,
  setOpenCreatePopup,
}: CreateNotificationPopupProps) => {
  return (
    <BasePopup
      open={openCreatePopup}
      title="Criar Notificação"
      onClose={() => setOpenCreatePopup(false)}
    >
      <CreateNotification onClose={() => setOpenCreatePopup(false)} />
    </BasePopup>
  );
};
