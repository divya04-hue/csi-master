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
import { Box, Heading } from "grommet";
//import "./datatable/buttons.dataTables.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@fortawesome/fontawesome-free/css/all.css";
import "datatables.net-select/js/dataTables.select.min";
import "datatables.net-select-dt/css/select.dataTables.min.css";
import "./style.css";
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
import {
  StatusCriticalSmall,
  StatusGoodSmall,
  StatusWarningSmall,
} from "grommet-icons";

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

const failedIcon = ReactDOMServer.renderToString(
  <StatusCriticalSmall size="small" color="red" />
);

const passedIcon = ReactDOMServer.renderToString(
  <StatusGoodSmall size="small" color="green" />
);

const warningIcon = ReactDOMServer.renderToString(
  <StatusWarningSmall size="small" color="rgb(255, 188, 68)" />
);

// import "./datatable/select.dataTables.min.css";
// import "./style.css";

const jzip = require("jszip/dist/jszip.min");
window.JSZip = jzip;

function PerHost() {
  const tableRef = useRef(null);
  const [title, setTitle] = useState("");
  const urlParams = new URLSearchParams(window.location.search);
  const param = urlParams.get("param");

  console.log(param);
  useEffect(() => {
    const data_table = $(tableRef.current).DataTable({
      dom: "<'flex-container'<'flex-item'f><'flex-item'l><'flex-item'><'flex-item'><'flex-item'><'flex-item'B>><'flex-container'<'flex-item'rt>><'flex-container'<'flex-item'i><'flex-item'><'flex-item'><'flex-item'><'flex-item'><'flex-item'p>>",
      buttons: [
        {
          extend: "copyHtml5",
          text: copyIconHtml,
          titleAttr: "Copy",
          title: param + " Compliance Report",
        },
        {
          extend: "excelHtml5",
          text: excelIconHtml,
          titleAttr: "Export to Excel",
          title: param + " Compliance Report",
        },
        {
          extend: "csvHtml5",
          text: csvIconHtml,
          titleAttr: "Export to CSV",
          title: param + " Compliance Report",
        },
        {
          extend: "pdfHtml5",
          text: pdfIconHtml,
          titleAttr: "Export to PDF",
          title: param + " Compliance Report",
        },
        {
          extend: "print",
          text: printIconHtml,
          titleAttr: "Print",
          title: param + " Compliance Report",
        },
      ],
      lengthMenu: [
        [10, 20, 30, -1],
        [10, 20, 30, "All"],
      ],
      paging: true,
      pageLength: 8,
      aoColumnDefs: [
        {
          orderable: false,
          className: "select-checkbox",
          aTargets: [0],
        },
        {
          sTitle: "Server Name",
          className: "text-center",
          aTargets: [1],
        },
        {
          sTitle: "Report Date",
          className: "text-center",
          aTargets: [2],
        },
        {
          sTitle: "Title",
          className: "text-center",
          aTargets: [3],
        },
        {
          sTitle: "Status",
          className: "text-center",
          aTargets: [4],
          mRender: function (st, type, full) {
            if (st === "passed") {
              return passedIcon + st;
            } else if (st === "failed") {
              return failedIcon + st;
            } else {
              return warningIcon + st;
            }
          },
        },
        {
          sTitle: "Remarks",
          className: "text-center",
          aTargets: [5],
        },
      ],
      select: {
        style: "multi",
        selector: "td:first-child",
      },
      order: [[1, "asc"]],
      responsive: true,
    });

    var dataSet = [];
    $.getJSON("merged_file.json?" + new Date().getTime(), function (result) {
      if (result.length > 0) {
        $.each(result, function (key, val) {
          let host_name = result[key].platform.host;
          let date_var = result[key].platform.report_name;
          let datePattern = /(\d{4}-\d{2}-\d{2})/;
          let datePart = datePattern.exec(date_var)[0];
          if (!param || param === host_name) {
            let date_var1 = result[key].platform.report_name;

            setTitle(date_var1);
            $.each(result[key].profiles, function (key2, val2) {
              $.each(
                result[key].profiles[key2].controls,
                function (key3, val3) {
                  $.each(
                    result[key].profiles[key2].controls[key3].results,
                    function (key4, val4) {
                      let dataRow = [],
                        statusFound = false,
                        failed_remarks = "",
                        manual_remarks = "",
                        excluded_remarks = "";
                      if (val4.status === "failed") {
                        $.each(
                          result[key].profiles[key2].controls[key3].results,
                          function (key4, val4) {
                            if (val4.status === "failed") {
                              failed_remarks =
                                failed_remarks + val4.code_desc + "<br>";
                            }
                          }
                        );
                        dataRow.push(
                          "",
                          host_name,
                          datePart,
                          val3.title,
                          val4.status,
                          failed_remarks
                        );
                        dataSet.push(dataRow);
                        statusFound = true;
                      } else if (val4.status === "excluded") {
                        $.each(
                          result[key].profiles[key2].controls[key3].results,
                          function (key4, val4) {
                            if (val4.status === "excluded") {
                              excluded_remarks =
                                excluded_remarks + val4.code_desc + "<br>";
                            }
                          }
                        );
                        dataRow.push(
                          "",
                          host_name,
                          datePart,
                          val3.title,
                          val4.status,
                          excluded_remarks
                        );
                        dataSet.push(dataRow);
                        statusFound = true;
                      } else if (val4.status === "manual") {
                        $.each(
                          result[key].profiles[key2].controls[key3].results,
                          function (key4, val4) {
                            if (val4.status === "manual") {
                              manual_remarks =
                                manual_remarks + val4.code_desc + "<br>";
                            }
                          }
                        );
                        dataRow.push(
                          "",
                          host_name,
                          datePart,
                          val3.title,
                          val4.status,
                          manual_remarks
                        );
                        dataSet.push(dataRow);
                        statusFound = true;
                      } else {
                        dataRow.push(
                          "",
                          host_name,
                          datePart,
                          val3.title,
                          val4.status,
                          ""
                        );
                        dataSet.push(dataRow);
                        statusFound = true;
                      }
                      if (statusFound) {
                        return false;
                      }
                    }
                  );
                }
              );
            });
          }
        });
      }
    }).done(function () {
      data_table.rows.add(dataSet).draw();
      //$.unblockUI();
    });

    return () => {
      data_table.destroy();
    };
  }, []);

  return (
    <Box pad="small" gap="medium">
      <Box pad="small" margin={{ left: "2%" }}>
        <Box align="start">
          <Heading level={2} style={{ fontWeight: "700" }}>
            {title}
          </Heading>
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
              <th className="notexport" style={{ width: "3%" }}></th>
              <th style={{ width: "7%", textAlign: "center" }}></th>
              <th style={{ width: "9%", textAlign: "center" }}></th>
              <th style={{ width: "30%", textAlign: "center" }}></th>
              <th style={{ width: "8%", textAlign: "center" }}></th>
              <th style={{ width: "37%" }}></th>
            </tr>
          </thead>
        </table>
      </Box>
    </Box>
  );
}

export default PerHost;
