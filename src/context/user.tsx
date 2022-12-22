import { createContext } from "react";
//user info(email) from firebase used to check if user is logged in
//will persist across tabs
const UserContext = createContext<any | null>(null);
export default UserContext;