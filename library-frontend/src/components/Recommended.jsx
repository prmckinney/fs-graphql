import { useQuery } from "@apollo/client/react";
import { GET_BOOKS, GET_USER } from "../queries";

const Recommended = (props) => {
  const { data: user } = useQuery(GET_USER);
  const result = useQuery(GET_BOOKS, {
    skip: !user,
    variables: { genre: user?.me.favoriteGenre },
  });

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  const books = result.data.allBooks;

  return (
    <div>
      <h2>Recommendations</h2>
      <div>
        Books in your favorite genre <b>{user?.me.favoriteGenre}</b>
      </div>
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
    </div>
  );
};

export default Recommended;
