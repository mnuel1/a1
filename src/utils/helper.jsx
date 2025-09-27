import { Eye, Trash, Edit } from "lucide-react";


export const buildColumns = (config) => {
  return config
    .filter((col) => col.displayFlags.table)
    .map((col) => {
      
      if (col.type === "actions") {
        return {
          name: col.label,
          cell: (row) => (
            <div className="flex gap-2 justify-center items-center">
              <button
                className="text-gray-700  py-1 rounded text-xs hover:text-blue-900 cursor-pointer"
                onClick={() => alert(`Viewing ${row.tracking_number}`)}
              >
                <Eye size={14} />
              </button>
              <button
                className="text-blue-500  py-1 rounded text-xs hover:text-blue-600 cursor-pointer"
                onClick={() => alert(`Editing ${row.tracking_number}`)}
              >
                <Edit size={14} />
              </button>
              <button
                className="text-red-500  py-1 rounded text-xs hover:text-red-600 cursor-pointer"
                onClick={() => alert(`Deleting ${row.tracking_number}`)}
              >
                <Trash size={14} />
              </button>
            </div>
          ),
          ignoreRowClick: true,          
          width: col.width || "120px",          
        };
      }

      return {
        name: col.label,
        selector: (row) => row[col.key] ?? `No ${col.label.toLowerCase()}`,
        sortable: col.sortable || false,
        style: col.sticky
          ? {
              position: "sticky",
              right: 0,
              minWidth: col.minWidth || "120px",
              backgroundColor: "white",
            }
          : {}        
      };
    });
};
