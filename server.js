import express from 'express'
import cookieParser from 'cookie-parser'


const app = express()
app.use(cookieParser())


app.get('/', (req, res) => res.send('Hello there'))
app.listen(3030, () => console.log('Server ready at port 3030')) 