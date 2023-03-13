import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export const apiSlice: any = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5000" }),
});

