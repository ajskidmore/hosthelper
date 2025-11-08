import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import { auth } from '../services/firebase';

// Create HTTP link
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
});

// Auth middleware to add Firebase token to requests
const authLink = new ApolloLink((operation, forward) => {
  return auth.currentUser?.getIdToken().then((token) => {
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    });
    return forward(operation);
  }) || forward(operation);
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
