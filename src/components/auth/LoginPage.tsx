import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as yup from "yup";
import styles from "./LoginPage.module.css";
import TextButton from "../buttons/TextButton";
import { AuthPayload } from "../../store/slices/authSlice";

type LoginFormValues = {
  username: string;
  password: string;
};

const validationSchema = yup.object().shape({
  username: yup.string().required("Обов'язково"),
  password: yup.string().required("Обов'язково"),
});

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async (
    values: LoginFormValues,
    { setSubmitting, setStatus }: FormikHelpers<LoginFormValues>
  ) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      const data: AuthPayload = await res.json();
      localStorage.setItem(
        "user",
        JSON.stringify({
          employeeId: data.employeeId,
          role: data.role,
          warehouseNumber: data.warehouseNumber,
          fullName: data.fullName,
        })
      );

      if (data.role === "Warehouse Manager") {
        navigate("/warehouses");
      } else if (data.warehouseNumber) {
        navigate(`/warehouse/${data.warehouseNumber}`);
      }
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles["login-container"]}>
        <div className={styles.brand}>
          <img src="/vite.svg" alt="" />
          <div>
            <p>WAREHOUSER</p>
            <h1>Вхід у систему</h1>
          </div>
        </div>
        <Formik<LoginFormValues>
        initialValues={{ username: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
      >
        {({ isSubmitting, status }) => (
          <Form className={styles["login-form"]}>
            <div className={styles["form-group"]}>
              <label htmlFor="username">Логін</label>
              <Field
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Введіть логін"
              />
              <ErrorMessage
                name="username"
                component="div"
                className={styles.error}
              />
            </div>

            <div className={styles["form-group"]}>
              <label htmlFor="password">Пароль</label>
              <Field
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Введіть пароль"
              />
              <ErrorMessage
                name="password"
                component="div"
                className={styles.error}
              />
            </div>

            {status && (
              <div className={styles.error} role="alert">
                {status}
              </div>
            )}

            <TextButton
              type="submit"
              disabled={isSubmitting}
              textValue="Увійти"
            />
          </Form>
        )}
        </Formik>
      </div>
    </main>
  );
}
