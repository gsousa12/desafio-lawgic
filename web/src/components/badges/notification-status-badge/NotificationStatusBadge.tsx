import { getStatusLabel } from "@/common/utils/convert";
import styles from "./NotificationStatusBadge.module.scss";

interface NotificationStatusBadgeProps {
  status: string;
}

export const NotificationStatusBadge = ({
  status,
}: NotificationStatusBadgeProps) => {
  const label = getStatusLabel(status);

  const variant: "progress" | "validation" | "done" | "neutral" = (() => {
    const s = (status || "").toLowerCase();

    if (s.includes("progress") || s.includes("progresso")) return "progress";
    if (s.includes("valid")) return "validation";
    if (s.includes("conclu") || s.includes("done") || s.includes("complete"))
      return "done";

    return "neutral";
  })();

  return <span className={`${styles.badge} ${styles[variant]}`}>{label}</span>;
};
