import app from './app';

const port = process.env.PORT || 3000;

try {
  app.listen(port, (): void => {
    console.log(`Connected successfully on port ${port}`);
  });
} catch (error) {
  console.error(error);
}
