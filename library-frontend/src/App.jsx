import { useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import Recommended from "./components/Recommended";
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
    setPage("authors");
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token ? (
          <button onClick={() => setPage("add")}>add book</button>
        ) : null}
        {token ? (
          <button onClick={() => setPage("recommended")}>recommend</button>
        ) : null}
        {!token ? (
          <button onClick={() => setPage("login")}>login</button>
        ) : (
          <button onClick={() => handleLogout()}>logout</button>
        )}
      </div>

      <Authors show={page === "authors"} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} />

      <Recommended show={page === "recommended"} />

      <LoginForm
        show={page === "login"}
        setPage={setPage}
        setToken={setToken}
      />
    </div>
  );
};

export default App;
