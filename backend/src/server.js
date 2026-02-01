import express from 'express';
import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'
import dotenv from 'dotenv';
const app= express()
dotenv.config()
const PORT= process.env.PORT || 3000;

app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/auth', authRoutes)


app.listen(PORT,()=>{
  console.log('server running on PORT: ',PORT)
})