import 'reflect-metadata';
import * as express from 'express';
import * as session from 'express-session';
import * as dotenv from 'dotenv';
import * as cors from 'cors';
import { createConnection } from 'typeorm';
import { ApolloServer } from 'apollo-server-express';

import { config } from './ormconfig';

import { schema } from './schema';
import { insertUser } from './seed';

dotenv.config();

const startServer = async (): Promise<void> => {
  const connection = await createConnection(config as any);

  await insertUser();

  if (connection) {
    console.log('Established connection');
  }

  const app = express();

  const corsOptions = {
    credentials: true,
    origin: 'http://localhost:3000'
  };

  app.use(cors(corsOptions));

  app.use(
    session({
      name: 'access_token',
      secret: process.env.SESSION_SECRET as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: (process.env.NODE_ENV as string) === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    })
  );

  const server = new ApolloServer({
    schema: await schema,
    context: ({ req }: { req: Request }) => ({ req })
  });

  server.applyMiddleware({ app, cors: corsOptions });

  app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

try {
  startServer();
} catch (e) {
  console.error(e);
}
