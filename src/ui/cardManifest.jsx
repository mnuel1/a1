import { DISPLAYFLAG } from "../utils/bitwiseflags";
import BoxBreakdown from "./cardManifestBoxBreakdown";
import { CardInput } from "./input";

const CardManifest = ({
  settings,
  deliveries,
  handleFieldChange,
  handleSubmit,
  status,
  canEdit = false,
  isReadOnly = false,
  boxBreakdownShow = true,
}) => {
  const CARD_FLAG = DISPLAYFLAG.CARD;
  const editable = canEdit && !isReadOnly;

  const cardFields = settings
    .filter(
      (f) =>
        (f.display & CARD_FLAG) === CARD_FLAG &&
        f.row > 0 &&
        f.order > 0 // skip row=0/order=0
    )
    .sort((a, b) => (a.row === b.row ? a.order - b.order : a.row - b.row));

  const rows = cardFields.reduce((acc, f) => {
    if (!acc[f.row]) acc[f.row] = [];
    acc[f.row].push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {deliveries.map((item) => {
        const boxes = item.delivery_boxes ?? [];
        const totalBoxes = boxes.length;
        const deliveredBoxes = boxes.filter((b) => b.status === "DELIVERED")
          .length;

        return (
          <div
            key={item.delivery_id}
            className="border rounded-lg p-6 shadow-sm bg-white max-w-8xl mx-auto text-sm"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">

                {Object.keys(rows).map((rowKey, index) => {
                  const fields = rows[rowKey];
                  const colCount = fields.length;
                  const isFirstRow = index === 0;

                  return (
                    <div key={rowKey} className="space-y-4">
                      <div
                        className={
                          isFirstRow
                            ? "flex flex-wrap gap-4 items-start"
                            : "grid gap-4 items-start"
                        }
                        style={
                          isFirstRow
                            ? undefined
                            : {
                              gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
                            }
                        }
                      >
                        {fields.map((f) => {
                          let value = item[f.cardKey] ?? "";

                          if (f.cardKey === "shipment_number")
                            value = item.shipments?.shipment_number ?? "";

                          if (f.cardKey === "container_number")
                            value = item.shipments?.container_number ?? "";

                          return (
                            <CardInput
                              key={f.cardKey}
                              type={f.type}
                              keyName={f.cardKey}
                              label={f.label}
                              value={value}
                              values={f.values}
                              parentid={item.delivery_id}
                              editable={editable}
                              handleFieldChange={handleFieldChange}
                            />
                          );
                        })}
                      </div>

                      {/* Divider after first row */}
                      {isFirstRow && <hr className="border-gray-300" />}
                    </div>
                  );
                })}

              </div>
              {/* Box Breakdown */}
              {boxBreakdownShow && (
                <BoxBreakdown
                  deliveryId={item.delivery_id}
                  boxes={boxes}
                  totalBoxes={totalBoxes}
                  deliveredBoxes={deliveredBoxes}
                  statusOptions={status}
                  editable={editable}
                  onChange={handleFieldChange}
                />
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!editable}
              className={`px-4 py-1 rounded-lg my-2 text-white ${editable
                ? "bg-primary hover:bg-primary-60"
                : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              Update
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default CardManifest;
