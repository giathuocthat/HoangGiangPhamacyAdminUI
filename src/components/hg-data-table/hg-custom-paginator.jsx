import { Paginator } from "primereact/paginator";
import React, { useState, useEffect } from "react";

const HgCustomPaginator = ({
  currentPage,
  totalPages,
  rows,
  totalRecords,
  onPageChange,
  setRows
}) => {
  const [pageInput, setPageInput] = useState(currentPage || 1);

  useEffect(() => {
    setPageInput(currentPage || 1);
  }, [currentPage]);

  const handlePaginatorChange = (event) => {
    onPageChange(event.page + 1);
  };

  const handleSelectChange = (value) => {
    setRows(Number(value));
  };

  const jumpToPage = (raw) => {
    let n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) n = 1;
    if (totalPages && n > totalPages) n = totalPages;
    setPageInput(n);
    if (n !== currentPage) onPageChange(n);
  };

  return (
    <>
      {totalPages ? (
        <>
          <div className="parent-class-datatable">
            <div className="dataTables_length" id="DataTables_Table_0_length">
              <label>
                Row Per Page{" "}
                <select
                  name="DataTables_Table_0_length"
                  aria-controls="DataTables_Table_0"
                  className="form-select form-select-sm"
                  value={rows}
                  onChange={(e) => handleSelectChange(e.target.value)}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>{" "}
                Entries
              </label>
            </div>
            <div
              className="dataTables_paginate paging_simple_numbers"
              id="DataTables_Table_0_paginate"
            >
              <Paginator
                first={(currentPage - 1) * rows}
                rows={rows}
                totalRecords={totalRecords}
                onPageChange={handlePaginatorChange}
              />
              <div className="paginator-jump d-inline-flex align-items-center ms-3">
                <label className="me-2 mb-0">Page</label>
                <input
                  type="number"
                  min={1}
                  max={totalPages || undefined}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') jumpToPage(e.target.value);
                  }}
                  onBlur={(e) => jumpToPage(e.target.value)}
                  className="form-control form-control-sm"
                  style={{ width: 80 }}
                />
                <button
                  className="btn btn-sm btn-primary ms-2"
                  onClick={() => jumpToPage(pageInput)}
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default HgCustomPaginator;