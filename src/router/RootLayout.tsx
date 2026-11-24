import { Outlet } from "react-router";
import styles from "./RootLayout.module.css";
import NavigationMenu from "../components/navigation-menu/NavigationMenu";
import TopBar from "../components/top-bar/TopBar";
import CustomModal from "../components/pop-ups/modal/CustomModal";
import { useDispatch } from "react-redux";
import { AuthPayload, login } from "../store/slices/authSlice";
import { useEffect } from "react";

export default function RootLayout() {
  const dispatch = useDispatch();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user: AuthPayload = JSON.parse(storedUser);
      dispatch(login(user));
    }
  }, [dispatch]);

  return (
    <>
      <div className={styles["container"]}>
        <nav className={styles.navigation} aria-label="Головна навігація">
          <NavigationMenu />
        </nav>
        <main className={styles.main}>
          <TopBar />
          <Outlet />
        </main>
      </div>
      <CustomModal />
    </>
  );
}
