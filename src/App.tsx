import { RouterProvider } from "react-router";
import router from "./router/router";

//import "primereact/resources/themes/viva-light/theme.css";

function App() {
  return <RouterProvider router={router} />;
}

export default App;
