import React from 'react';
import axios from 'axios';

const route = process.env.REACT_APP_FINBERRY_DEVELOPMENT === "true" ? 'http://localhost:5000/' : "https://finberry-stock-simulator-server.vercel.app/";

const ArticlesPage = () => {
    const [items, setItems] = React.useState<any[]>([]);

    React.useEffect(() => {
      axios.get(route + 'Educational').then((response) => {
        setItems(response.data);
      });
    }, []);

    return (
        <div>
            <h1>
                Finberry Articles Page
            </h1>
            {items.map((item) => (
            <li key={item._id}>
                <p> Name: {item.title}</p>
                <p> Description: {item.description}</p>
                <p> Content: {item.content}</p>        
                <a href={item.externalLink}>Article Link</a>
                <p> First Posted: {item.firstPosted}</p>
                <p> Last Update: {item.lastUpdate}</p>
            </li>
            ))}
        </div>
        
    )
}

export default ArticlesPage;