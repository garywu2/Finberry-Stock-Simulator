import React from 'react'
import axios from 'axios'

const ArticlesPage = () => {
    const [items, setItems] = React.useState<any[]>([]);

    React.useEffect(() => {
      axios.get('http://localhost:5000/Educational').then((response) => {
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