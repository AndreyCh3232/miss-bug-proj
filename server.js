import express from 'express'
import cookieParser from 'cookie-parser'
import { bugService } from './bug.service.js'

const app = express()
app.use(express.json())
app.use(cookieParser())


app.get('/', (req, res) => res.send('Hello there'))
app.listen(3030, () => console.log('Server ready at port 3030'))

app.get('/api/bug', (req, res) => {
    const bugs = bugService.query()
    res.send(bugs)
})

app.get('/api/bug/save', (req, res) => {
    const bug = bugService.save(req.body)
    res.send(bug)
})

app.get('/api/bug/:bugId', (req, res) => {
    const bug = bugService.getById(req.params.bugId)
    res.send(bug)

})

app.get('/api/bug/:bugId/remove', (req, res) => {
    bugService.remove(req.params.bugId)
    res.send({ msg: 'Bug removed successfully' })
})