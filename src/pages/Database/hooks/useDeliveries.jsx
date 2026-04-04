// hooks/useDeliveries.js
import { useQuery } from "@tanstack/react-query"
import { getDeliveries } from "../api/delivery"

const ROW_LIMIT = 25

export const useDeliveries = ({
  status,
  shipmentNumber,
  search,
  page,
  restrictions,
}) => {
  const queryKey = [
    "deliveries",
    { status, shipment_number: shipmentNumber, search },
    page,
  ]

  const { data, isFetching, isError } = useQuery({
    queryKey,
    queryFn: () =>
      getDeliveries(
        { status, shipment_number: shipmentNumber, search },
        page,
        ROW_LIMIT,
        restrictions
      ),
    enabled: !!(status && shipmentNumber),
    keepPreviousData: true,
  })

  return {
    deliveries: data?.data ?? [],
    totalRows: data?.totalCount ?? 0,
    isFetching,
    isError,
    queryKey,  // exposed so useTableModal can invalidate on save
    ROW_LIMIT,
  }
}