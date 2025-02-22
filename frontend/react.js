import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/items');
      setItems(response.data);
    } catch (error) {
      console.error("There was an error fetching the data!", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessage = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/hello');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('Error occurred: ' + error.message);
    }
  };

  return (
    <div className="App">
      <h1>Flask & React Example</h1>
      <button onClick={fetchMessage}>Get Message from Flask</button>
      <p>{message}</p>
      <h1>Items List</h1>
      <button onClick={fetchItems}>Fetch Items</button>
      {loading && <p>Loading...</p>}
      {!loading && items.length > 0 && (
        <table border="1">
          <thead>
            <tr>
              <th>1</th>
              <th>2</th>
              <th>3</th>
              <th>4</th>
              <th>5</th>
              <th>6</th>
              <th>7</th>
              <th>8</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.id1}</td>
                <td>{item.id2}</td>
                <td>{item.id3}</td>
                <td>{item.id4}</td>
                <td>{item.id5}</td>
                <td>{item.id6}</td>
                <td>{item.id7}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;