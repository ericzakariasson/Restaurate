import 'reflect-metadata';
import * as express from 'express';
import * as session from 'express-session';
import * as dotenv from 'dotenv';
import * as cors from 'cors';
import { useContainer } from 'typeorm';
import { ApolloServer } from 'apollo-server-express';
import { generateSchema } from './schema';
import { Context } from './graphql/types';
import { Container } from 'typedi';
import { createConnection } from './utils/createConnection';
import {
  GraphQLRequestContext,
  ApolloServerPlugin
} from 'apollo-server-plugin-base';
import { logger } from './utils/logger';
import { redis } from './services/redis/redis';
import * as connectRedis from 'connect-redis';
import * as helmet from 'helmet';
import * as sendgrid from '@sendgrid/mail';
import { v2 as cloudinary } from 'cloudinary';
import * as shortid from 'shortid';

dotenv.config();
cloudinary.config(true);

sendgrid.setApiKey(process.env.SENDGRID_API_KEY as string);

const RedisStore = connectRedis(session);

const startServer = async (): Promise<void> => {
  useContainer(Container);
  const connection = await createConnection();

  if (!connection) {
    logger.error('Could not established connection to database');
  }

  const app = express();

  app.use(helmet());

  logger.debug('Allowed origins', process.env.ALLOWED_ORIGINS);

  const corsOptions = {
    credentials: true,
    origin: process.env.ALLOWED_ORIGINS
  };

  app.use(cors(corsOptions));

  app.set('trust proxy', true);

  app.use(
    session({
      name: 'access_token',
      secret: process.env.SESSION_SECRET as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 daysm
      },
      proxy: true,
      store: new RedisStore({
        client: redis as any,
        prefix: 'session:'
      })
    })
  );

  const schema = await generateSchema();

  const server = new ApolloServer({
    schema,
    context: ({ req }): Context => {
      const requestId = shortid.generate();

      const container = Container.of(requestId);
      const context = { container, req, requestId };
      container.set('context', context);

      return context;
    },
    plugins: [
      {
        requestDidStart: () => ({
          willSendResponse({ context }: GraphQLRequestContext<Context>) {
            Container.reset(context.requestId);
          }
        })
      }
    ] as ApolloServerPlugin[],
    formatError: error => {
      logger.error('Apollo Server Error', error);
      return error;
    }
  });

  server.applyMiddleware({ app, cors: corsOptions });

  app.listen({ port: 4000 }, () =>
    logger.debug(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

try {
  startServer();
} catch (e) {
  logger.error('Unexpected error occured:', e);
}
