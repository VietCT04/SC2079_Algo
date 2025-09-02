import React from "react";

interface NumberDisplayProps {
  label: string;
  value: number;
}

export const NumberDisplay = (props: NumberDisplayProps) => {
  const { label, value } = props;
  return (
    <div className="flex items-center rounded bg-sky-600">
      <div className="px-2 py-1 text-white">{label}:</div>

      <div className="px-2 py-1 text-gray-900 bg-white border border-gray-300 rounded-r shadow">
        {value}
      </div>
    </div>
  );
};
