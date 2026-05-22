const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const Author = require("./models/author");
const Book = require("./models/book");

const resolvers = {
  Query: {
    me: (root, args, context) => {
      return context.currentUser;
    },
    authorCount: async () => {
      const authors = await Author.find({});
      return authors.length;
    },
    bookCount: async () => {
      const books = await Book.find({});
      return books.length;
    },
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
    bookCount: async (root) => {
      const author = await Author.findOne({ name: root.name });
      const books = await Book.find({ author: author });
      return books.length;
    },
  },
  Mutation: {
    createUser: async (root, args) => {
      const user = new User(args);

      return user.save().catch((error) => {
        throw new GraphQLError(`Creating the user failed: ${error.message}`, {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });
      });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },

    addBook: async (root, args, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }

      const authorExists = await Author.findOne({ name: args.author });
      if (!authorExists) {
        const author = new Author({ name: args.author });
        try {
          await author.save();
        } catch (error) {
          throw new GraphQLError(`Adding author failed: ${error.message}`, {
            extensions: {
              code: "BAD_USER_INPUT",
              error,
            },
          });
        }
      }

      const author_id = await Author.findOne({ name: args.author });
      const book = new Book({ ...args, author: author_id });
      try {
        await book.save();
      } catch (error) {
        throw new GraphQLError(`Adding book failed: ${error.message}`, {
          extensions: {
            code: "BAD_USER_INPUT",
            error,
          },
        });
      }

      return book;
    },

    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }

      const author = await Author.findOne({ name: args.name });
      if (author) {
        author.born = args.setBornTo;
        try {
          await author.save();
        } catch (error) {
          throw new GraphQLError(`Updating author failed: ${error.message}`, {
            extensions: {
              code: "BAD_USER_INPUT",
              error,
            },
          });
        }
      }
      return author;
    },
    _resetDatabase: async () => {
      if (process.env.NODE_ENV !== "test") {
        throw new GraphQLError("_resetDatabase is only available in test mode");
      }
      await Author.deleteMany({});
      await Book.deleteMany({});
      await User.deleteMany({});
      return true;
    },
  },
};

module.exports = resolvers;
