import styles from "../../styles/auth/AuthLayout.module.css";

function AuthLayout({ children }) {
  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.card}>{children}</div>
      </div>
    </div>
  );
}

export default AuthLayout;
