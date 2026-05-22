import { useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("library-user-token"),
  );
  const [page, setPage] = useState("authors");
  const client = useApolloClient();

  const handleLogout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token ? (
          <button onClick={() => setPage("add")}>add book</button>
        ) : null}
        {!token ? (
          <button onClick={() => setPage("login")}>Login</button>
        ) : (
          <button onClick={() => handleLogout()}>Logout</button>
        )}
      </div>

      <Authors show={page === "authors"} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} />

      <LoginForm
        show={page === "login"}
        setPage={setPage}
        setToken={setToken}
      />
    </div>
  );
};

export default App;
