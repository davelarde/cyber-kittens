const express = require('express');
const app = express();
const { User } = require('./db');

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/', async (req, res, next) => {
  try {
    res.send(`
      <h1>Welcome to Cyber Kittens!</h1>
      <p>Cats are available at <a href="/kittens/1">/kittens/:id</a></p>
      <p>Create a new cat at <b><code>POST /kittens</code></b> and delete one at <b><code>DELETE /kittens/:id</code></b></p>
      <p>Log in via POST /login or register via POST /register</p>
    `);
  } catch (error) {
    console.error(error);
    next(error)
  }
});

// Verifies token with jwt.verify and sets req.user
// TODO - Create authentication middleware
app.use(async (req, res, next)=>{
  const auth = req.header('Authorization')
  if(!auth){
    res.send(401)
    next()
  }else{
    const [, token] = auth.split(" ");
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  }
})

// POST /register
// OPTIONAL - takes req.body of {username, password} and creates a new user with the hashed password

app.post('/register', async(req,res,next)=>{
  try{
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, SALT_COUNT);
    const user = await User.create({ username, password: hash });
    const token = jwt.sign({ username, id: user.id }, process.env.JWT_SECRET)
    res.send({ message: "success", token });
  }catch(error){
    next(error)
  }
})

// POST /login
// OPTIONAL - takes req.body of {username, password}, finds user by username, and compares the password with the hashed version from the DB

app.post('/login', async(req,res,next)=>{
  const isMatch = await bcrypt.compare(password, foundUser.password)
  try{
    const {username, password} = req.body
    const [foundUser]= await User.findAll({where:{username}})
    if(!foundUser){
      res.send(401)
    }if (!isMatch){
      res.status(401).send("Unauthorized")
    }else{
      const token= jwt.sign(username, process.env.JWT_SECRET)
      res.status(200).send({message: 'success', token: token})
    }
  }catch(error){
    next(error)
  }
})

// GET /kittens/:id
// TODO - takes an id and returns the cat with that id

// POST /kittens
// TODO - takes req.body of {name, age, color} and creates a new cat with the given name, age, and color

// DELETE /kittens/:id
// TODO - takes an id and deletes the cat with that id

// error handling middleware, so failed tests receive them
app.use((error, req, res, next) => {
  console.error('SERVER ERROR: ', error);
  if(res.statusCode < 400) res.status(500);
  res.send({error: error.message, name: error.name, message: error.message});
});

// we export the app, not listening in here, so that we can run tests
module.exports = app;
