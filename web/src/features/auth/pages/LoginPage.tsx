import { useLoginPageController } from "../controllers/login-page.controller";
import { TextInput } from "@/components/TextInput/TextInput";
import { Button } from "@/components/Button/Button";
import { CircleX, EyeIcon, EyeOffIcon } from "lucide-react";
import styles from "./LoginPage.module.scss";
import { Loader } from "@/components/loader/Loader";
import { AlertPopup } from "@/components/popups/alert-popup/AlertPopup";
import { motion, AnimatePresence } from "framer-motion";

export const LoginPage = () => {
  const {
    isMobile,
    leftImageSrc,
    register,
    errors,
    onSubmit,
    isSubmitting,
    showPassword,
    togglePasswordVisibility,
    loginIsPending,
    loginIsError,
    loginError,
    openAlertPopUp,
    setOpenAlertPopUp,
    getUserInfoIsPending,
  } = useLoginPageController();

  return (
    <motion.div
      className={styles.root}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9 }}
    >
      <div className={styles.root}>
        {!isMobile && (
          <div
            className={styles.left}
            style={{ backgroundImage: `url(${leftImageSrc})` }}
            aria-hidden
          />
        )}

        <div className={styles.right}>
          <div className={styles.card}>
            <h1 className={styles.title}>Lawgic Notificações</h1>{" "}
            <p className={styles.subtitle}>
              Sistema de gerenciamento de notificações judiciais
            </p>
            <form className={styles.form} onSubmit={onSubmit} noValidate>
              <TextInput
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder=""
                error={errors.email?.message}
                {...register("email")}
              />

              <TextInput
                id="password"
                label="Senha"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder=""
                error={errors.password?.message}
                rightIcon={showPassword ? <EyeOffIcon /> : <EyeIcon />}
                onRightIconClick={togglePasswordVisibility}
                {...register("password")}
              />

              <Button type="submit" loading={isSubmitting} fullWidth>
                {isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </div>
        </div>
        {loginIsPending && <Loader />}
        {loginIsError && !loginIsPending && (
          <AlertPopup
            open={openAlertPopUp}
            title="Erro ao efetuar login"
            description={loginError?.message}
            icon={<CircleX />}
            confirmLabel="Ok"
            onConfirm={() => {
              setOpenAlertPopUp(false);
            }}
          />
        )}
      </div>
    </motion.div>
  );
};
