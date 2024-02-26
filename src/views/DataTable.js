import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "datatables.net";
import "datatables.net-buttons/js/buttons.html5";
import "datatables.net-buttons/js/buttons.print";
import "datatables.net-buttons/js/buttons.flash";
import "datatables.net-buttons/js/buttons.colVis";
import "pdfmake/build/pdfmake.min";
import "pdfmake/build/vfs_fonts";
import "datatables.net-responsive-dt";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Layer,
  Spinner,
  Text,
} from "grommet";
// import "./datatable/buttons.dataTables.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "datatables.net-select/js/dataTables.select.min";
import "datatables.net-select-dt/css/select.dataTables.min.css";
import "@fortawesome/fontawesome-free/css/all.css";
import {
  faCopy,
  faFileExcel,
  faFileCsv,
  faFilePdf,
  faPrint,
} from "@fortawesome/free-solid-svg-icons";
import ReactDOMServer from "react-dom/server";
import pdfMake from "pdfmake/build/pdfmake.min";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { Link } from "react-router-dom";
import "./style.css";
import { StatusGoodSmall, StatusCriticalSmall } from "grommet-icons";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const copyIconHtml = ReactDOMServer.renderToString(
  <FontAwesomeIcon icon={faCopy} />
);
const excelIconHtml = ReactDOMServer.renderToString(
  <FontAwesomeIcon icon={faFileExcel} />
);
const csvIconHtml = ReactDOMServer.renderToString(
  <FontAwesomeIcon icon={faFileCsv} />
);
const pdfIconHtml = ReactDOMServer.renderToString(
  <FontAwesomeIcon icon={faFilePdf} />
);
const printIconHtml = ReactDOMServer.renderToString(
  <FontAwesomeIcon icon={faPrint} />
);

const nonComplaintIcon = ReactDOMServer.renderToString(
  <StatusCriticalSmall size="small" color="red" />
);

const complaintIcon = ReactDOMServer.renderToString(
  <StatusGoodSmall size="small" color="green" />
);

// import "./datatable/select.dataTables.min.css";

const jzip = require("jszip/dist/jszip.min");
window.JSZip = jzip;

function DataTable() {
  const [complaint, setComplaint] = useState("");
  const [nonComplaint, setNonComplaint] = useState("");
  const [show, setShow] = useState(false);
  const [averagePercentage, setAveragePercentage] = useState("");
  const tableRef = useRef(null);
  useEffect(() => {
    const data_table = $(tableRef.current).DataTable({
      dom: "<'flex-container'<'flex-item'f><'flex-item'l><'flex-item'><'flex-item'><'flex-item'B>><'flex-container'<'flex-item'rt>><'flex-container'<'flex-item'i><'flex-item'><'flex-item'><'flex-item'><'flex-item'><'flex-item'p>>",
      buttons: [
        {
          extend: "copyHtml5",
          text: copyIconHtml,
          titleAttr: "Copy",
          title: "All Servers Compliance Report",
        },
        {
          extend: "excelHtml5",
          text: excelIconHtml,
          titleAttr: "Export to Excel",
          title: "COMPLIANCE SCAN REPORT",
        },
        {
          extend: "csvHtml5",
          text: csvIconHtml,
          titleAttr: "Export to CSV",
          title: "COMPLIANCE SCAN REPORT",
        },
        {
          extend: "pdfHtml5",
          text: pdfIconHtml,
          titleAttr: "Export to PDF",
          title: "COMPLIANCE SCAN REPORT",
        },
        {
          extend: "print",
          text: printIconHtml,
          titleAttr: "Print",
          title: "COMPLIANCE SCAN REPORT",
        },
      ],
      lengthMenu: [
        [10, 20, 30, -1],
        [10, 20, 30, "All"],
      ],
      paging: true,
      pageLength: 5,
      aoColumnDefs: [
        {
          orderable: false,
          className: "select-checkbox",
          aTargets: [0],
        },
        {
          sTitle: "Server",
          className: "text-center",
          aTargets: [1],
        },
        {
          sTitle: "Report Date",
          className: "text-center",
          aTargets: [2],
        },
        {
          sTitle: "Compliant Status",
          className: "text-center",
          aTargets: [3],
          mRender: function (st, type, full) {
            if (st === "Non-Compliant") {
              return nonComplaintIcon + st;
            } else {
              return complaintIcon + st;
            }
          },
        },
        {
          sTitle: "Compliance Percentage",
          className: "text-center",
          aTargets: [4],
        },
        {
          sTitle: "Total Compliance Checked",
          className: "text-center",
          aTargets: [5],
        },
        {
          sTitle: "Successful",
          className: "text-center",
          aTargets: [6],
        },
        {
          sTitle: "Failed",
          className: "text-center",
          aTargets: [7],
        },
        {
          sTitle: "Excluded",
          className: "text-center",
          aTargets: [8],
        },
        {
          sTitle: "OS Platform",
          className: "text-center",
          aTargets: [9],
        },
        {
          sTitle: "Report Link",
          className: "text-center",
          bSortable: false,
          aTargets: [10],
          mRender: function (url, type, full) {
            return '<a href="/perhost?param=' + full[1] + '">Report Link</a>';
          },
        },
      ],
      select: {
        style: "multi",
        selector: "td:first-child",
      },
      order: [[1, "asc"]],
      responsive: true,
    });

    const dataSet = [];
    $.getJSON("merged_file.json?" + new Date().getTime(), function (result) {
      setShow(true);
      if (result.length > 0) {
        let count_compliant = 0;
        let count_noncompliant = 0;

        $.each(result, function (key, val) {
          let dataRow = [];
          let total_count = 0;
          let passed_count = 0;
          let failed_count = 0;
          let skipped_count = 0;
          let waived_count = 0;
          let status = "";
          let date_var = result[key].platform.report_name;
          const datePattern = /(\d{4}-\d{2}-\d{2})/;
          const datePart = datePattern.exec(date_var)[0];
          $.each(result[key].profiles, function (key2, val2) {
            let statusFound = false;
            $.each(result[key].profiles[key2].controls, function (key3, val3) {
              $.each(
                result[key].profiles[key2].controls[key3].results,
                function (key4, val4) {
                  if (val4.status === "failed") {
                    failed_count++;
                    total_count++;
                    statusFound = true;
                  } else if (val4.status === "excluded") {
                    waived_count++;
                    total_count++;
                    statusFound = true;
                  } else if (val4.status === "manual") {
                    skipped_count++;
                    total_count++;
                    statusFound = true;
                  } else {
                    passed_count++;
                    total_count++;
                    statusFound = true;
                  }
                  if (statusFound) {
                    return false;
                  }
                }
              );
            });
          });
          if (failed_count > 0) {
            status = "Non-Compliant";
            count_noncompliant = count_noncompliant + 1;
          } else {
            status = "Compliant";
            count_compliant = count_compliant + 1;
          }

          setComplaint(count_compliant);

          setNonComplaint(count_noncompliant);
          let percent_data = passed_count / (total_count - waived_count);
          percent_data = (percent_data * 100).toFixed(2) + "%";
          dataRow.push(
            "",
            val.platform.host,
            datePart,
            status,
            percent_data,
            total_count,
            passed_count,
            failed_count,
            waived_count,
            val.platform.os_distro_info,
            val.platform.report_link
          );
          dataSet.push(dataRow);
        });
      }
    }).done(function () {
      data_table.rows.add(dataSet).draw();
      function calculateAveragePercentage(dataSet) {
        let totalPercentage = 0;
        let numberOfPercentages = 0;

        dataSet.forEach((subArray) => {
          const percentage = parseFloat(subArray[4].replace("%", ""));
          if (!isNaN(percentage)) {
            totalPercentage += percentage;
            numberOfPercentages++;
          }
        });
        if (numberOfPercentages === 0) return 0;
        return totalPercentage / numberOfPercentages;
      }
      const averagePercentage = calculateAveragePercentage(dataSet);
      setAveragePercentage(averagePercentage.toFixed(2) + "%");
      setShow(false);
    });

    return () => {
      data_table.destroy();
    };
  }, []);

  return (
    <Box pad="small" gap="medium" flex={false}>
      {show && (
        <Layer>
          <Box
            align="center"
            justify="center"
            gap="small"
            direction="row"
            alignSelf="center"
            pad="medium"
          >
            <Spinner />
            <Text> Loading </Text>
          </Box>
        </Layer>
      )}
      <Box pad="small" margin={{ left: "2%" }}>
        <Box align="start">
          <Heading level={2} style={{ fontWeight: "700" }}>
            All Servers Compliance Report
          </Heading>
        </Box>
        <Box direction="row" gap="small">
          <Card height="150px" width="250px" background="white">
            <CardHeader
              pad="small"
              gap="small"
              style={{ fontSize: "20px", fontWeight: "700" }}
            >
              Total compliant nodes
            </CardHeader>
            <CardBody
              pad="small"
              style={{
                fontSize: "50px",
                fontWeight: "500",
                color: "rgb(1, 169, 130)",
              }}
            >
              {complaint}
            </CardBody>
          </Card>
          <Card height="150px" width="250px" background="white">
            <CardHeader
              pad="small"
              style={{ fontSize: "20px", fontWeight: "700" }}
            >
              Total Non-compliant nodes
            </CardHeader>
            <CardBody
              pad="small"
              style={{
                fontSize: "50px",
                fontWeight: "500",
                color: "rgb(1, 169, 130)",
              }}
            >
              {nonComplaint}
            </CardBody>
          </Card>
          <Card height="150px" width="250px" background="white">
            <CardHeader
              pad="small"
              style={{ fontSize: "20px", fontWeight: "700" }}
            >
              Report link of all servers
            </CardHeader>
            <CardBody
              pad="small"
              style={{ fontSize: "20px", fontWeight: "500" }}
            >
              <Link to="/all-report">Go to All Report</Link>
            </CardBody>
          </Card>
          <Card height="150px" width="250px" background="white">
            <CardHeader
              pad="small"
              style={{ fontSize: "20px", fontWeight: "700" }}
            >
              Complete compliance percentage
            </CardHeader>
            <CardBody
              pad="small"
              style={{
                fontSize: "50px",
                fontWeight: "500",
                color: "rgb(1, 169, 130)",
              }}
            >
              {averagePercentage}
            </CardBody>
          </Card>
        </Box>
      </Box>
      <Box>
        <table
          ref={tableRef}
          id="result_dataTable"
          className="display"
          style={{ width: "100%", gap: "200px" }}
        >
          <thead>
            <tr>
              <th className="notexport"></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          {/* <tbody></tbody> */}
        </table>
      </Box>
    </Box>
  );
}

export default DataTable;
