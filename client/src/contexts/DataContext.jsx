import { createContext, useContext, useState, useEffect } from "react";
import { fetchPosts, fetchCategories } from "../services";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [postsData, categoriesData] = await Promise.all([
        fetchPosts(),
        fetchCategories(),
      ]);
      setPosts(postsData.data);
      setCategories(categoriesData.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <DataContext.Provider
      value={{ posts, categories, loading, error, refreshData }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);