const timeMiddleware = (_req, res, next) => {
  const currentTime = new Date().toISOString();
  console.log(`Current time: ${currentTime}`);

  res.locals.currentTime = currentTime; // Store the current time in response locals

  next();
};

export default timeMiddleware;
