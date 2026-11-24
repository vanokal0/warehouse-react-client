import { Navigate, useLocation } from "react-router-dom";
import { AuthPayload } from "../../store/slices/authSlice";

type Props = {
  children: React.ReactNode;
  allowedRoles?: string[]; // можна передати список дозволених ролей
};

export default function RequireAuth({ children, allowedRoles }: Props) {
  const location = useLocation();
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const user: AuthPayload = JSON.parse(storedUser);

  if (!user.employeeId) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role ?? "")) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
