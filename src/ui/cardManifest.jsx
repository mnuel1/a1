import { DISPLAYFLAG } from "../api/settings";

const CardManifest = ({
  settings,
  deliveries,
  handleFieldChange,
  handleSubmit,
  status,
  canEdit = false,
  isReadOnly = false,
}) => {
  const CARD_FLAG = DISPLAYFLAG.CARD;

  const cardFields = settings
    .filter((f) => (f.display & CARD_FLAG) === CARD_FLAG)
    .sort((a, b) => (a.row === b.row ? a.order - b.order : a.row - b.row));

  const groupByRow = cardFields.reduce((acc, field) => {
    if (!acc[field.row]) acc[field.row] = [];
    acc[field.row].push(field);
    return acc;
  }, {});

  const editable = canEdit && !isReadOnly;

  return (
    <div className="space-y-8">
      {deliveries.map((item) => (
        <div
          key={item.delivery_id}
          className="border rounded-lg p-6 shadow-sm bg-white max-w-5xl mx-auto text-sm"
        >
          {/* HEADER: Shipment / Container / Tracking */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex gap-4 flex-wrap">
              {groupByRow[1]?.map((f) => {
                if (f.cardKey === "status") return null; // skip status for now

                let value = item[f.cardKey] || "";

                // SPECIAL CASES
                if (f.cardKey === "shipment_number") {
                  value = item.shipments?.shipment_number || "";
                }
                if (f.cardKey === "container_number") {
                  value = item.shipments?.container_number || "";
                }

                return (
                  <div key={f.cardKey} className="flex gap-2">
                    <strong>{f.label}</strong>
                    <span className="underline">{value}</span>
                  </div>
                );
              })}
            </div>

            {groupByRow[1]
              ?.filter((f) => f.cardKey === "status")
              .map((f) => (
                <div key={f.cardKey} className="flex flex-col ml-auto">
                  <strong>{f.label}</strong>
                  <select
                    className="border px-2 py-1 rounded"
                    value={item[f.cardKey] || ""}
                    onChange={(e) =>
                      editable &&
                      handleFieldChange(item.delivery_id, f.cardKey, e.target.value)
                    }
                    disabled={!editable}
                  >
                    <option value="">Select {f.label}</option>
                    {status.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
          </div>

          {/* BARCODE + # OF BOXES + # DELIVERED + AGENT */}
          <div className="flex flex-wrap gap-6 mb-4 items-end">
            {groupByRow[2]
              ?.filter((f) => f.label.toLowerCase() === "barcode no.")
              .map((f) => (
                <label key={f.cardKey} className="flex flex-col">
                  <strong className="text-black">{f.label}</strong>
                  <input
                    className="border px-2 py-1 rounded w-32"
                    value={item[f.cardKey] || ""}
                    onChange={(e) =>
                      editable &&
                      handleFieldChange(item.delivery_id, f.cardKey, e.target.value)
                    }
                    disabled={!editable}
                  />
                </label>
              ))}

            {/* # of Boxes / # Delivered */}
            <label className="flex flex-col text-black">
              <strong># of Boxes / # Delivered</strong>
              <div className="flex items-center border rounded px-2 py-1 w-42">
                {groupByRow[2]
                  ?.filter((f) => f.label.toLowerCase() === "# of boxes")
                  .map((f) => (
                    <input
                      key={f.cardKey}
                      className="outline-none w-16 text-center"
                      value={item[f.cardKey] || ""}
                      onChange={(e) =>
                        editable &&
                        handleFieldChange(item.delivery_id, f.cardKey, e.target.value)
                      }
                      disabled={!editable}
                    />
                  ))}

                <span className="px-1 select-none">/</span>

                {groupByRow[7]
                  ?.filter((f) => f.label.toLowerCase() === "# of delivered boxes")
                  .map((f) => (
                    <input
                      key={f.cardKey}
                      className="outline-none w-16 text-center"
                      value={item[f.cardKey] || ""}
                      onChange={(e) =>
                        editable &&
                        handleFieldChange(item.delivery_id, f.cardKey, e.target.value)
                      }
                      disabled={!editable}
                    />
                  ))}
              </div>
            </label>

            {/* Agent */}
            {groupByRow[2]
              ?.filter((f) => f.label.toLowerCase() === "agent")
              .map((f) => (
                <label key={f.cardKey} className="flex flex-col">
                  <strong className="text-black">{f.label}</strong>
                  <input
                    className="border px-2 py-1 rounded w-32"
                    value={item[f.cardKey] || ""}
                    onChange={(e) =>
                      editable &&
                      handleFieldChange(item.delivery_id, f.cardKey, e.target.value)
                    }
                    disabled={!editable}
                  />
                </label>
              ))}
          </div>

          <hr className="my-3" />

          {/* SHIPPER / CONSIGNEE */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <h3 className="font-semibold text-black mb-1">Sender/Shipper</h3>
              {groupByRow[3]
                ?.filter((f) => f.cardKey.includes("shipper"))
                .map((f) => (
                  <label key={f.cardKey} className="block mb-1">
                    <strong>{f.label}:</strong>{" "}
                    <input
                      className="border px-2 py-1 rounded w-full"
                      value={item[f.cardKey] || ""}
                      onChange={(e) =>
                        editable &&
                        handleFieldChange(item.delivery_id, f.cardKey, e.target.value)
                      }
                      disabled={!editable}
                    />
                  </label>
                ))}
            </div>

            <div>
              <h3 className="font-semibold text-black mb-1">Receiver/Consignee</h3>
              {groupByRow[3]
                ?.filter((f) => f.cardKey.includes("consignee"))
                .map((f) => (
                  <label key={f.cardKey} className="block mb-1">
                    <strong>{f.label}:</strong>{" "}
                    <input
                      className="border px-2 py-1 rounded w-full"
                      value={item[f.cardKey] || ""}
                      onChange={(e) =>
                        editable &&
                        handleFieldChange(item.delivery_id, f.cardKey, e.target.value)
                      }
                      disabled={!editable}
                    />
                  </label>
                ))}
            </div>
          </div>

          {/* ADDRESS / CITY / REGION */}
          <div className="flex flex-col gap-3 mb-4">
            {groupByRow[5]
              ?.filter((f) => f.label.toLowerCase() === "consignee address")
              .map((f) => (
                <label key={f.cardKey} className="flex flex-col gap-2 mb-1">
                  <strong className="whitespace-nowrap">{f.label}:</strong>
                  <input
                    className="border px-2 py-1 rounded w-full"
                    value={item[f.cardKey] || ""}
                    onChange={(e) =>
                      editable &&
                      handleFieldChange(item.delivery_id, f.cardKey, e.target.value)
                    }
                    disabled={!editable}
                  />
                </label>
              ))}

            <div className="flex gap-3">
              {groupByRow[5]
                ?.filter(
                  (f) =>
                    f.label.toLowerCase() === "city" ||
                    f.label.toLowerCase() === "region"
                )
                .map((f) => (
                  <label key={f.cardKey} className="flex flex-col gap-2 mb-1 w-full">
                    <strong className="whitespace-nowrap">{f.label}:</strong>
                    {f.type === "dropdown" ? (
                      <select
                        className="border px-2 py-1 rounded w-full"
                        value={item[f.cardKey] || ""}
                        onChange={(e) =>
                          editable &&
                          handleFieldChange(item.delivery_id, f.cardKey, e.target.value)
                        }
                        disabled={!editable}
                      >
                        <option value="">Select {f.label}</option>
                        {f.values.split("|").map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="border px-2 py-1 rounded w-full"
                        value={item[f.cardKey] || ""}
                        onChange={(e) =>
                          editable &&
                          handleFieldChange(item.delivery_id, f.cardKey, e.target.value)
                        }
                        disabled={!editable}
                      />
                    )}
                  </label>
                ))}
            </div>
          </div>

          <hr className="my-3" />

          {/* DELIVERY INFO */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {groupByRow[6]?.map((f) => (
              <label key={f.cardKey} className="block">
                <strong>{f.label}:</strong>{" "}
                <input
                  type={f.type === "date" ? "date" : "text"}
                  className="border px-2 py-1 rounded w-full"
                  value={item[f.cardKey] || ""}
                  onChange={(e) =>
                    editable &&
                    handleFieldChange(item.delivery_id, f.cardKey, e.target.value)
                  }
                  disabled={!editable}
                />
              </label>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!editable}
            className={`px-4 py-1 rounded-lg my-2 text-white ${
              !editable
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary-60 cursor-pointer"
            }`}
          >
            Update
          </button>
        </div>
      ))}
    </div>
  );
};

export default CardManifest;
