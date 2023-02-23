import UserContext from "../../context/user";
import { useContext, useState } from "react";
import React from 'react'
import axios from 'axios'

const ProfilePage = () => {
    const { user } = useContext(UserContext);
    const [items, setItems] = React.useState<any>([]);

    React.useEffect(() => {
    
      axios.get('http://localhost:5000/account/user/' + String(user.email)).then((response) => {
        setItems(response.data);
        console.log(items)
      });
    }, []);

    return (
        <div>
            <h1>
                Profile placeholder
            </h1>
            <p>
                {user.email}
            </p>
            <p>
            {items.baseInfo ? (
            <p>
                Welcome to your Profile, {items.baseInfo.firstName} {items.baseInfo.lastName}
            </p>
            ) : (
                <h1>error</h1>
            )}
            </p>
        </div>
    )
}

export default ProfilePage;