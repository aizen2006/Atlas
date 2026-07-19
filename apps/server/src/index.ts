import { Hono } from 'hono'
import chat  from './routes/chat'
const app = new Hono()

// routes

app.route('/chat',chat);

// global error handling

app.onError((err, c) => {
  console.error(`${err}`)
  return c.text('Error happend while handling your request', 500)
});

// not
app.notFound((c)=>{
  return c.text("The Route is Not Found",404)
})

export default app
