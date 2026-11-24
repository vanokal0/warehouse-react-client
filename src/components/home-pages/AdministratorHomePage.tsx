import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

export default function AdministratorHomePage() {
  const authData = useSelector((state: RootState) => state.auth);

  return (
    <>
      <h2>
        {`WELCOME ${authData.employeeId}, the ${authData.role} from ${authData.warehouseNumber}`}
      </h2>
    </>
  );
}
