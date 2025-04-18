import connectPgSimple from "connect-pg-simple";
import session from "express-session";

let middleware = undefined;

const setupSession = (app) => {
    if(middleware === undefined){
        const pgSession = connectPgSimple(session);
        middleware = session({
            store: new pgSession({
                conObject:{
                    user: process.env.DB_USER,
                    host: process.env.DB_HOST,
                    database: process.env.DB_NAME,
                    password: process.env.DB_PASSWORD,
                    port: process.env.DB_PORT,
                },
                createTableIfMissing: true,
            }),
            secret: process.env.SESSION_SECRET,
            resave: true,
            saveUninitialized: false,
        });

        app.use(middleware);
    }
    return middleware;
};

export default setupSession ;