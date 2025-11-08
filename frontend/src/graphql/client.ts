import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { auth } from '../services/firebase';

// Create HTTP link
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
});

// Auth middleware to add Firebase token to requests
const authLink = setContext(async (_, { headers }) => {
  const token = await auth.currentUser?.getIdToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          properties: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          bookings: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          tasks: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
