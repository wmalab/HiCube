import React from "react";
import useCollapse from "react-collapsed";
import classes from "./Collapsible.module.css";

const CollapsedIcon = () => {
  return <ion-icon name="caret-forward-outline"></ion-icon>;
};

const ExpandedIcon = () => {
  return <ion-icon name="caret-down-outline"></ion-icon>;
};

const DeleteIcon = () => {
  return <ion-icon name="trash-outline"></ion-icon>;
};

const Collapsible = (props) => {
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse({
    defaultExpanded: props.defaultCollapsed ? false : true,
  });

  let className = `${classes.collapsible}`;
  if (props.className) {
    className = `${className} ${props.className}`;
  }

  return (
    <div className={className}>
      <div className={classes.header}>
        <button {...getToggleProps()}>
          <span className={classes.icon}>
            {isExpanded ? <ExpandedIcon /> : <CollapsedIcon />}
          </span>
          <span>{props.title}</span>
        </button>
        {props.onDelete && (
          <button onClick={props.onDelete} className={classes.delete}>
            <span className={classes.icon}>
              <DeleteIcon />
            </span>
          </button>
        )}
      </div>
      <div {...getCollapseProps()}>
        <div className={classes.content}>{props.children}</div>
      </div>
    </div>
  );
};

export default Collapsible;
