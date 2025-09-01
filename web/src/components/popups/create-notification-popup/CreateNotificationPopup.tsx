import { CreateNotification } from "@/components/create-notification/CreateNotification";
import { BasePopup } from "../base-popup/BasePopup";

interface CreateNotificationPopupProps {
  openCreatePopup: boolean;
  setOpenCreatePopup: (open: boolean) => void;
  refetch: () => void;
}

export const CreateNotificationPopup = ({
  openCreatePopup,
  setOpenCreatePopup,
  refetch,
}: CreateNotificationPopupProps) => {
  return (
    <BasePopup
      open={openCreatePopup}
      title="Criar Notificação"
      onClose={() => setOpenCreatePopup(false)}
    >
      <CreateNotification
        onClose={() => setOpenCreatePopup(false)}
        refetch={refetch}
      />
    </BasePopup>
  );
};
