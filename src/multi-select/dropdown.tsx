/**
 * A generic dropdown component.  It takes the children of the component
 * and hosts it in the component.  When the component is selected, it
 * drops-down the contentComponent and applies the contentProps.
 */
import { css } from "goober";
import React, { useEffect, useRef, useState } from "react";
import cx from "classnames";

import Arrow from "./arrow";
import Loading from "./loading";

const PADDING = 30;

interface IDropdownProps {
  children?;
  contentComponent;
  contentProps: object;
  isLoading?: boolean;
  disabled?: boolean;
  shouldToggleOnHover?: boolean;
  labelledBy?: string;
  onMenuToggle?;
  ArrowRenderer?;
  panelWidth?: number;
}

const PanelContainer = css({
  position: "absolute",
  zIndex: 1,
  top: "100%",
  width: "100%",
  paddingTop: "8px",
  ".panel-content": {
    maxHeight: "300px",
    overflowY: "auto",
    borderRadius: "var(--rmsc-radius)",
    background: "var(--rmsc-bg)",
    boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.1), 0 4px 11px rgba(0, 0, 0, 0.1)",
  },
});

const DropdownContainer = css({
  position: "relative",
  outline: 0,
  backgroundColor: "var(--rmsc-bg)",
  border: "1px solid var(--rmsc-border)",
  borderRadius: "var(--rmsc-radius)",
  "&:focus-within": {
    boxShadow: "var(--rmsc-main) 0 0 0 1px",
    borderColor: "var(--rmsc-main)",
  },
});

const PanelContainerRightToLeft = css({
  right: 0,
});

const PanelContainerWidth = (value: number) =>
  css({
    width: `${value}px`,
  });

const DropdownHeading = css({
  position: "relative",
  padding: "0 var(--rmsc-p)",
  display: "flex",
  alignItems: "center",
  width: "100%",
  height: "var(--rmsc-h)",
  cursor: "default",
  outline: 0,
  ".dropdown-heading-value": {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },
});

const Dropdown = ({
  children,
  contentComponent: ContentComponent,
  contentProps,
  isLoading,
  disabled,
  shouldToggleOnHover,
  labelledBy,
  panelWidth,
  onMenuToggle,
  ArrowRenderer,
}: IDropdownProps) => {
  const [expanded, setExpanded] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [direction, setDirection] = useState("left-to-right");
  const FinalArrow = ArrowRenderer || Arrow;
  const hasPanelWidth = !!panelWidth;

  const wrapper: any = useRef();

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    onMenuToggle && onMenuToggle(expanded);
  }, [expanded]);

  const handleKeyDown = (e) => {
    switch (e.which) {
      case 27: // Escape
      case 38: // Up Arrow
        setExpanded(false);
        wrapper?.current?.focus();
        break;
      case 32: // Space
      case 13: // Enter Key
      case 40: // Down Arrow
        setExpanded(true);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  const handleHover = (iexpanded: boolean) => {
    shouldToggleOnHover && setExpanded(iexpanded);
  };

  const handleFocus = () => !hasFocus && setHasFocus(true);

  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setHasFocus(false);
      setExpanded(false);
    }
  };

  const handleMouseEnter = () => handleHover(true);

  const handleMouseLeave = () => handleHover(false);

  const hasSpace = (elRef: HTMLElement, additionalWidth?: number) => {
    if (!additionalWidth) {
      return true;
    }
    const { innerWidth } = window;
    const { x } = elRef.getBoundingClientRect();
    return x + additionalWidth < innerWidth - PADDING;
  };

  const toggleExpanded = (e: any) => {
    // Changes in this file from source
    // add function to verify if there is enough space to render if not will move to the left
    const dir = hasSpace(e.currentTarget, panelWidth)
      ? "left-to-right"
      : "right-to-left";
    setDirection(dir);
    setExpanded(isLoading || disabled ? false : !expanded);
  };

  return (
    <div
      tabIndex={0}
      className={`${DropdownContainer} dropdown-container`}
      aria-labelledby={labelledBy}
      aria-expanded={expanded}
      aria-readonly={true}
      aria-disabled={disabled}
      ref={wrapper}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`${DropdownHeading} dropdown-heading`}
        onClick={toggleExpanded}
      >
        <div className="dropdown-heading-value">{children}</div>
        {isLoading && <Loading />}
        <FinalArrow expanded={expanded} />
      </div>
      {expanded && (
        <div
          className={cx(
            PanelContainer,
            {
              [PanelContainerWidth(panelWidth!)]: hasPanelWidth,
            },
            {
              [PanelContainerRightToLeft]: direction === "right-to-left",
            },
            "dropdown-content"
          )}
        >
          <div className="panel-content">
            <ContentComponent {...contentProps} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
