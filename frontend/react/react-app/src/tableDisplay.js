import React, { useState } from "react";
import * as utils from "./utils";

const TableDisplay = ({ items, checkedLabels }) => {
  const itemsPerPage = 30;
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const generatePagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      let startPage = Math.max(2, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);

      if (startPage > 2) {
        pageNumbers.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <table className="data-table" border="1">
          <thead>
            <tr>
              <th>#</th>
              {checkedLabels.map((column) => (
                <th key={column}>{utils.translate(column)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={item.id || index}>
                <td>{indexOfFirstItem + index + 1}</td>
                {checkedLabels.map((column) => (
                  <td key={column}>
                    {column === "datetime"
                      ? utils.formatDate(item[column])
                      : item[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          이전
        </button>

        {generatePagination().map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} style={{ margin: "0 5px" }}>
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                margin: "0 5px",
                fontWeight: currentPage === page ? "bold" : "normal",
              }}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default TableDisplay;
