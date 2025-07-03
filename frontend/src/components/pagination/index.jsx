import React from "react";
import ReactPaginate from 'react-paginate';
import "./styles.css";
import {IoIosArrowBack, IoIosArrowForward} from "react-icons/io";
import {IoEllipsisHorizontalSharp} from "react-icons/io5";

const Index = ({totalPages, currentPage, onPageChange, isDisabled}) => {
    if (totalPages <= 0) return <></>;

    return (
        <ReactPaginate
            pageCount={totalPages}
            pageRangeDisplayed={3}
            marginPagesDisplayed={2}
            onPageChange={onPageChange}
            containerClassName={`pagination ${isDisabled ? 'pagination-disabled' : ''}`}
            pageClassName="page-item"
            pageLinkClassName="page-link"
            activeClassName="active"
            disabledClassName="disabled"
            previousLabel={<IoIosArrowBack/>}
            nextLabel={<IoIosArrowForward/>}
            breakLabel={<IoEllipsisHorizontalSharp/>}
            initialPage={currentPage}
            forcePage={currentPage}
            disabled={isDisabled}
        />
    );
};

export default Index;
