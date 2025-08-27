import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ title: "", cuisine: "", rating: "" });
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const fetchRecipes = async () => {
    try {
      let url = "http://localhost:5000/api/recipes";

      // If any filter is applied, use search endpoint
      if (filters.title || filters.cuisine || filters.rating) {
        const params = new URLSearchParams();
        if (filters.title) params.append("title", filters.title);
        if (filters.cuisine) params.append("cuisine", filters.cuisine);
        if (filters.rating) params.append("rating", filters.rating);
        params.append("page", page);
        params.append("limit", limit);
        url = `http://localhost:5000/api/recipes/search?${params.toString()}`;
      } else {
        url += `?page=${page}&limit=${limit}`;
      }

      const response = await axios.get(url);
      setRecipes(response.data.data);
      setTotal(response.data.total);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [page, limit, filters]);

  return (
    <div className="app-container">
      <h1>Recipe Dashboard</h1>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Filter by Title"
          value={filters.title}
          onChange={(e) => setFilters({ ...filters, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filter by Cuisine"
          value={filters.cuisine}
          onChange={(e) => setFilters({ ...filters, cuisine: e.target.value })}
        />
        <input
          type="number"
          placeholder="Filter by Rating"
          value={filters.rating}
          onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
        />
      </div>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Cuisine</th>
            <th>Rating</th>
            <th>Total Time</th>
            <th>Serves</th>
          </tr>
        </thead>
        <tbody>
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
              <tr key={recipe.id} onClick={() => setSelectedRecipe(recipe)}>
                <td>{recipe.title}</td>
                <td>{recipe.cuisine}</td>
                <td>{recipe.rating}</td>
                <td>{recipe.total_time}</td>
                <td>{recipe.serves}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No recipes found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span>
          Page {page} of {Math.max(1, Math.ceil(total / limit))}
        </span>
        <button disabled={page * limit >= total} onClick={() => setPage(page + 1)}>
          Next
        </button>
        <select value={limit} onChange={(e) => setLimit(parseInt(e.target.value))}>
          {[15, 20, 30, 50].map((num) => (
            <option key={num} value={num}>
              {num} per page
            </option>
          ))}
        </select>
      </div>

      {/* Drawer */}
      {selectedRecipe && (
        <div className="drawer">
          <button className="close-btn" onClick={() => setSelectedRecipe(null)}>
            X
          </button>
          <h2>{selectedRecipe.title}</h2>
          <p>
            <strong>Cuisine:</strong> {selectedRecipe.cuisine}
          </p>
          <p>
            <strong>Description:</strong> {selectedRecipe.description}
          </p>
          <p>
            <strong>Total Time:</strong> {selectedRecipe.total_time} mins
          </p>
          <p>
            <strong>Prep Time:</strong> {selectedRecipe.prep_time} mins
          </p>
          <p>
            <strong>Cook Time:</strong> {selectedRecipe.cook_time} mins
          </p>

          {/* Nutrients Table */}
          {selectedRecipe.nutrients && (
            <table className="nutrients-table">
              <thead>
                <tr>
                  {Object.keys(selectedRecipe.nutrients).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {Object.values(selectedRecipe.nutrients).map((value, idx) => (
                    <td key={idx}>{value}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
