import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export const apiSlice: any = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5000" }),
  tagTypes: ["Orders", "Stores", "User"],
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: (userId) => `/orders/user/${userId}`,
      providesTags: ["Orders"],
    }),
    getStore: builder.query({
      query: (id: any) => `/stores/${id}`,
    }),
    getOrderFoodItems: builder.query({
      query: (id: any) => `/orders/${id}/food-items`,
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetStoreQuery,
  useGetOrderFoodItemsQuery,
  useUpdateCartItemQuantityMutation,
} = apiSlice;
