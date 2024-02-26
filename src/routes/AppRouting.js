import { Route, Routes } from "react-router-dom";
import DataTable from "../views/DataTable";
import AllReport from "../views/AllReport";
import PerHost from "../views/PerHost";

const AppRouting = () => {
  return (
    <Routes>
      <Route path="/" element={<DataTable />} />
      <Route path="/all-report" element={<AllReport />} />
      <Route path="/perhost" element={<PerHost />} />
    </Routes>
  );
};

export default AppRouting;
