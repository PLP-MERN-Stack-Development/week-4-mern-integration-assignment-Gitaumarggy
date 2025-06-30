import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const useApi = (url, method = "get", body = null, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
    axios({ 
      url: fullUrl, 
      method, 
      data: body,
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error('API Error:', err);
        setError(err.response?.data || err.message);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, deps);

  return { data, loading, error };
};

export default useApi;