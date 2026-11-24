import { isRouteErrorResponse, useRouteError } from "react-router";
import styles from "./ErrorPage.module.css";

export default function ErrorPage() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : null;

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.code}>{status ?? "!"}</span>
        <p className={styles.eyebrow}>WAREHOUSER</p>
        <h1>Не вдалося відкрити сторінку</h1>
        <p className={styles.description}>
          Перевірте з’єднання із сервером і спробуйте оновити сторінку.
        </p>
        <div className={styles.actions}>
          <button onClick={() => window.location.reload()}>Спробувати ще раз</button>
          <a href="/">На головну</a>
        </div>
      </section>
    </main>
  );
}
