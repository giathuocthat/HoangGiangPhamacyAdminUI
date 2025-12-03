// import React from "react";
// import { DataTable } from "primereact/datatable";
// import { Column } from "primereact/column";
// import HgCustomPaginator from "./hg-custom-paginator";
// import { Skeleton } from "primereact/skeleton";
// // import { noRecord } from "../../utils/imagepath";

// const PaginatorDataTable = ({
//   column,
//   data = [],
//   totalRecords,
//   currentPage = 1,
//   setCurrentPage,
//   rows = 10,
//   setRows,
//   sortable = true,
//   footer = null,
//   loading = false,
//   isPaginationEnabled = true,
//   serverSide = false,
//   // sorting props
//   sortField,
//   sortOrder,
//   onSort,
//   selectionMode,
//   selection,
//   onSelectionChange
// }) => {
//   const skeletonRows = Array.from({ length: rows }, (_, i) => ({ id: `skeleton-${currentPage || 0}-${i}` }));
//   const totalPages = Math.ceil(totalRecords / rows);

//   // Calculate paginated data
//   let paginatedData;
//   if (loading) {
//     paginatedData = skeletonRows;
//   } else if (serverSide) {
//     // When serverSide is enabled the `data` prop contains only the current page rows
//     paginatedData = data;
//   } else {
//     const startIndex = (currentPage - 1) * rows;
//     const endIndex = startIndex + rows;
//     paginatedData = data.slice(startIndex, endIndex);
//   }

//   const onPageChange = (newPage) => {
//     setCurrentPage(newPage);
//   };

//   const customEmptyMessage = () => (
//     <div className="no-record-found">
//       {/* <img src={noRecord} alt="no-record"></img> */}
//       <h4>No records found.</h4>
//       <p>No records to show here...</p>
//     </div>
//   );

//   // Prepare DataTable props based on selection mode
//   const getDataTableProps = () => {
//     const baseProps = {
//       value: paginatedData,
//       className: "table custom-table datatable",
//       totalRecords: totalRecords,
//       paginator: false,
//       emptyMessage: customEmptyMessage,
//       footer: footer,
//       dataKey: "id"
//     };

//     // Include sorting props for DataTable when provided
//     if (sortField) baseProps.sortField = sortField;
//     if (typeof sortOrder !== 'undefined') baseProps.sortOrder = sortOrder;
//     if (onSort) baseProps.onSort = onSort;
//     // single-column sort mode; PrimeReact expects numeric sortOrder (1 or -1)
//     baseProps.sortMode = 'single';

//     if (selectionMode && ['multiple', 'checkbox'].includes(selectionMode)) {
//       return {
//         ...baseProps,
//         selectionMode: selectionMode,
//         selection: selection,
//         onSelectionChange: onSelectionChange
//       };
//     } else if (selectionMode && ['single', 'radiobutton'].includes(selectionMode)) {
//       return {
//         ...baseProps,
//         selectionMode: selectionMode,
//         selection: selection,
//         onSelectionChange: onSelectionChange
//       };
//     } else {
//       return baseProps;
//     }
//   };

//   return (
//     <>
//       <DataTable {...getDataTableProps()}>
//         {column?.map((col, index) => (
//           <Column
//             header={col.header}
//             key={col.field || index}
//             field={col.field}
//             body={(rowData, options) => {
//               return loading ? (
//                 <Skeleton
//                   width="100%"
//                   height="2rem"
//                   className="skeleton-glow"
//                 />
//               ) : col.body ? (
//                 col.body(rowData, options)
//               ) : (
//                 rowData[col.field]
//               );
//             }}
//             sortable={sortable === false ? false : col.sortable !== false}
//             sortField={col.sortField ? col.sortField : col.field}
//             className={col.className ? col.className : ""}
//           />
//         ))}
//       </DataTable>
//       {isPaginationEnabled && (
//         <HgCustomPaginator
//           currentPage={currentPage}
//           totalPages={totalPages}
//           totalRecords={totalRecords}
//           onPageChange={onPageChange}
//           rows={rows}
//           setRows={setRows}
//         />
//       )}
//     </>
//   );
// };

// export default PaginatorDataTable;

// Component con của product-list: Chuyển trang list sản phẩm ở data table
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import HgCustomPaginator from "./paginator-custom";
import { Skeleton } from "primereact/skeleton";

const PaginatorDataTable = ({
  column,
  data = [],
  totalRecords,
  currentPage = 1,
  setCurrentPage,
  rows = 10,
  setRows,
  sortable = true,
  footer = null,
  loading = false,
  isPaginationEnabled = true,
  serverSide = false, // If true, NO client-side slicing
  sortField,
  sortOrder,
  onSort,
  selectionMode,
  selection,
  onSelectionChange
}) => {
  const skeletonRows = Array.from({ length: rows }, (_, i) => ({ 
    id: `skeleton-${currentPage || 0}-${i}` 
  }));

  const totalPages = Math.ceil(totalRecords / rows);

  // Calculate display data
  let displayData;
  if (loading) {
    displayData = skeletonRows;
  } else if (serverSide) {
    // Backend already paginated - use data as-is
    displayData = data;
  } else {
    // Client-side pagination - slice the data
    const startIndex = (currentPage - 1) * rows;
    const endIndex = startIndex + rows;
    displayData = data.slice(startIndex, endIndex);
  }

  const onPageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const customEmptyMessage = () => (
    <div className="no-record-found">
      <h4>No records found.</h4>
      <p>No records to show here...</p>
    </div>
  );

  const getDataTableProps = () => {
    const baseProps = {
      value: displayData,
      className: "table custom-table datatable",
      totalRecords: totalRecords,
      paginator: false,
      emptyMessage: customEmptyMessage,
      footer: footer,
      dataKey: "id"
    };

    // Add sorting if provided
    if (sortField) baseProps.sortField = sortField;
    if (typeof sortOrder !== 'undefined') baseProps.sortOrder = sortOrder;
    if (onSort) baseProps.onSort = onSort;
    baseProps.sortMode = 'single';

    // Add selection if provided
    if (selectionMode) {
      baseProps.selectionMode = selectionMode;
      baseProps.selection = selection;
      baseProps.onSelectionChange = onSelectionChange;
    }

    return baseProps;
  };

  return (
    <>
      <DataTable {...getDataTableProps()}>
        {column?.map((col, index) => (
          <Column
            header={col.header}
            key={col.field || index}
            field={col.field}
            body={(rowData, options) => {
              return loading ? (
                <Skeleton width="100%" height="2rem" className="skeleton-glow" />
              ) : col.body ? (
                col.body(rowData, options)
              ) : (
                rowData[col.field]
              );
            }}
            sortable={sortable === false ? false : col.sortable !== false}
            sortField={col.sortField ? col.sortField : col.field}
            className={col.className ? col.className : ""}
          />
        ))}
      </DataTable>
      {isPaginationEnabled && (
        <HgCustomPaginator
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          onPageChange={onPageChange}
          rows={rows}
          setRows={setRows}
        />
      )}
    </>
  );
};

export default PaginatorDataTable;