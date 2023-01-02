import { onAuthStateChanged } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import FirebaseContext from "../context/firebase";

export default function useAuthListener() {
  //This is the user object from firebase only containing the user email
  //fetch user from server for the complete user info
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("firebaseAuthUser")!)
  );
  const { auth } = useContext(FirebaseContext);

  useEffect(() => {
    const listener = onAuthStateChanged(auth, (authUser) => {
      // store auth in local storage when user signs in
      if (authUser) {
        localStorage.setItem("firebaseAuthUser", JSON.stringify(authUser));
        setUser(authUser);
      } else {
        //clear the local storage when the user sign out
        localStorage.removeItem("firebaseAuthUser");
        setUser(null);
      }
    });
    return () => listener();
  }, [auth]);
  return { user };
}