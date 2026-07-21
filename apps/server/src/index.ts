import { Hono } from 'hono'
import chat  from './routes/chat'
import { syncSkills } from './libs/utils'
const app = new Hono()

// pick up any SKILL.md added or edited on disk since the last boot.
// not awaited — a local directory scan finishes long before the first request
// gets through title generation and planning to actually ask for a skill.
void syncSkills()
  .then((count)=>console.log(`Synced ${count} skill(s)`))
  .catch((err)=>console.error("Skill sync failed",err));

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
