import React, { ReactElement, ReactNode, isValidElement } from "react";

/** Decorate grid[y][x] with a red highlight. Safe for ReactNode[][] grids. */
export function applyCenterHighlight(
  grid: ReactNode[][],
  center?: { x: number; y: number }
): ReactNode[][] {
  if (!center) return grid;
  const { x: cx, y: cy } = center;

  return grid.map((row, y) =>
    row.map((cell, x) => {
      // If it's not a valid element (string/number/null), just return it
      if (!isValidElement(cell)) return cell;

      const el = cell as ReactElement<any>;
      const key = el.key ?? `cell-${y}-${x}`;
      const isCenter = x === cx && y === cy;

      if (!isCenter) {
        return React.cloneElement(el, { key });
      }

      const prevClass = el.props?.className ?? "";
      const prevStyle = el.props?.style ?? {};

      return React.cloneElement(el, {
        key,
        className: [prevClass, "bg-red-500/30 ring-2 ring-red-500"]
          .filter(Boolean)
          .join(" "),
        style: {
          ...prevStyle,
          boxShadow:
            (prevStyle.boxShadow ? prevStyle.boxShadow + ", " : "") +
            "inset 0 0 0 2px rgba(239,68,68,0.9)",
        },
      });
    })
  );
}
