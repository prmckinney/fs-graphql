const { GraphQLError } = require("graphql");
const Author = require("./models/author");
const Book = require("./models/book");

let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
];

let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"],
  },
  {
    title: "Demons",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"],
  },
];

const resolvers = {
  Query: {
    authorCount: () => authors.length,
    bookCount: () => books.length,
    allBooks: async (root, args) => {
      if (!args.author && !args.genre) {
        return Book.find({});
      } else if (args.author && !args.genre) {
        const author = await Author.findOne({ name: args.author });
        if (author) return Book.find({ author: author.id });
        else return null;
      } else if (!args.author && args.genre) {
        return Book.find({ genres: args.genre });
      } else if (args.author && args.genre) {
        const author = await Author.findOne({ name: args.author });
        if (author) return Book.find({ author: author.id, genres: args.genre });
        else return null;
      }

      // if (args.genre)
      //   return booksFiltered.filter((book) =>
      //     book.genres.find((genre) => genre === args.genre),
      //   );
      // else return booksFiltered;
    },
    allAuthors: async () => {
      return Author.find({});
    },
  },
  Book: {
    author: async (root) => {
      return Author.findOne({ _id: root.author });
    },
  },
  Author: {
    bookCount: (root) => {
      return Book.filter((book) => book.author === root.name).length;
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      console.log("args ==> ", args);
      const authorExists = await Author.findOne({ name: args.author });
      console.log("authorExists ==> ", authorExists);

      if (!authorExists) {
        const author = new Author({ name: args.author });

        try {
          await author.save();
        } catch (error) {
          throw new GraphQLError(`Saving author failed: ${error.message}`, {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.name,
              error,
            },
          });
        }
        console.log("author ==> ", author);
      }

      const author_id = await Author.findOne({ name: args.author });
      // const id = author_id._id;
      console.log("authorID ==> ", author_id);

      const book = new Book({ ...args, author: author_id });
      console.log("book ==> ", book);

      try {
        await book.save();
      } catch (error) {
        throw new GraphQLError(`Saving book failed: ${error.message}`, {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            error,
          },
        });
      }

      return book;
    },

    // addBooks: (root, args) => {
    //   if (!authors.find((author) => author.name === args.author)) {
    //     const newAuthor = { name: args.author, id: uuid() };
    //     authors = authors.concat(newAuthor);
    //   }
    //   const newBook = { ...args, id: uuid() };
    //   books = books.concat(newBook);
    //   return newBook;
    // },
    editAuthor: (root, args) => {
      const author = authors.find((author) => author.name === args.name);
      if (author) author.born = args.setBornTo;
      return author;
    },
    reset: async () => {
      await Author.deleteMany({});
      await Book.deleteMany({});
      return true;
    },
  },
};

module.exports = resolvers;
