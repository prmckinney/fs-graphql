import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_BOOKS } from "../queries";

const Books = (props) => {
  const [filter, setFilter] = useState("");

  const result = useQuery(GET_BOOKS, {
    variables: { genre: filter },
  });

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  const books = result.data.allBooks;
  const genres = result.data.allGenres;

  const handleFilter = (event) => {
    event.preventDefault();
    setFilter(event.target.value);
  };
  const handleClearFilter = (event) => {
    event.preventDefault();
    setFilter("");
  };

  return (
    <div>
      <h2>books</h2>
      {filter ? (
        <div>
          in genre <b>{filter}</b>
        </div>
      ) : null}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {genres.map((genre) => (
          <button key={genre} onClick={handleFilter} value={genre}>
            {genre}
          </button>
        ))}
        <button onClick={handleClearFilter}>All Genres</button>
      </div>
    </div>
  );
};

export default Books;
