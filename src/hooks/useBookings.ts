import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { axiosBase } from "@woothomes/lib";
import {
  UseBookingsInterface,
  UseBookingsResponse,
  useBookingsStore,
} from "@woothomes/store";

export function useBookings({
  page,
  filter = {},
  url,
}: UseBookingsInterface): UseQueryResult<UseBookingsResponse> {
  const { setBookings, setLoading, setError } = useBookingsStore();

  return useQuery({
    queryKey: ["bookings", page, url, filter],
    queryFn: async () => {
      setLoading(true);
      setError(null);

      try {
        const baseUrl = url || "/bookings/history";
        const params = new URLSearchParams({
          page: page.toString(),
          per_page: "12",
        });

        if (filter.status) params.append("status", filter.status);
        if (filter.payment_status)
          params.append("payment_status", filter.payment_status);
        if (filter.property_type)
          params.append("property_type", filter.property_type);
        if (filter.type) params.append("type", filter.type);
        if (filter.start_date) params.append("start_date", filter.start_date);
        if (filter.end_date) params.append("end_date", filter.end_date);

        const finalUrl = `${baseUrl}?${params.toString()}`;
        const response = await axiosBase.get(finalUrl);
        const data = response.data?.data;

        if (!data) {
          const emptyResult = {
            bookings: [],
            meta: {
              last_page: 1,
              total: 0,
              current_page: 1,
              from: 0,
              to: 0,
              per_page: 12,
              path: "",
              links: [],
              has_more_pages: false,
            },
          };
          setBookings([], emptyResult.meta);
          return emptyResult;
        }

        setBookings(data, response.data.meta);
        return {
          bookings: data.bookings,
          meta: data.meta,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Error fetching bookings:", err);
        setError(err?.message || "Failed to fetch bookings");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
