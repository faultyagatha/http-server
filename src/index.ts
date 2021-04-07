// Your code here
import { HttpServer } from './server'

const server = new HttpServer(3000);

server.get('/', (req, res) => {
  res.status(200).send('Home page');
})

server.post('/api/posts', (req, res) => {
  res.status(200).send('posted');
  const post = req.payload;
  if (post) {
    res.status(200).send('posted');
    //res.status(200).send(post);
  }
})

server.delete('/api/posts/:postId', (req, res) => {
  // const postId = req.params.postId
  // res.status(200).send(`Deleted ${postId}`)
})

server.put('/api/posts/:postId', (req, res) => {
  // const postId = req.params.postId
  // res.status(200).send(`Updated ${postId}`)
})

server.listen((err) => {
  if (err) console.log(err);
  console.log('listening on port');
})
