import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type appState = {
  appState: string;
  userInfo: any;
  stocks: any;
};

const initialState: appState = {
  appState: "",
  stocks: [],
  userInfo: {},
};

export const appStateSlice = createSlice({
  name: "appState",
  initialState,
  reducers: {
    setAppState: (state, action: PayloadAction<string>) => {
      state.appState = action.payload;
    },
    setUserInfoState: (state, action: any) => {
      state.userInfo = action.payload;
    },
    setStocksState: (state, action: any) => {
      state.stocks = action.payload;
    },

    resetState: (state) => {
      state.appState = "";
      state.userInfo = {};
      state.stocks = {};
    },
  },
});

export const {
  setAppState,
  setUserInfoState,
  setStocksState,
  resetState,
} = appStateSlice.actions;

export default appStateSlice.reducer;
