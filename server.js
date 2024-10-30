import express from 'express'
import cookieParser from 'cookie-parser'
import { bugService } from './bug.service.js'
import PDFDocument from 'pdfkit'

const app = express()
app.use(express.json())
app.use(cookieParser())


app.get('/', (req, res) => res.send('Hello there'))
app.listen(3030, () => console.log('Server ready at port 3030'))

app.get('/api/bug', async (req, res) => {
    const bugs = await bugService.query()
    res.json(bugs)
})

app.post('/api/bug/save', async (req, res) => {
    const bug = req.body
    const savedBug = await bugService.save(bug)
    res.json(savedBug)
})

app.get('/api/bug/:bugId', async (req, res) => {
    const { bugId } = req.params
    const bug = await bugService.getById(bugId)
    res.json(bug)
})

app.delete('/api/bug/:bugId/remove', async (req, res) => {
    const { bugId } = req.params
    await bugService.remove(bugId)
    res.send('Bug removed')
})

app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    let visitedBugs = req.cookies.visitedBugs || []

    if (!visitedBugs.includes(bugId)) {
        visitedBugs.push(bugId)
    }

    if (visitedBugs.length > 3) {
        return res.status(401).send('Wait for a bit')
    }

    res.cookie('visitedBugs', visitedBugs, { maxAge: 7000 })
    console.log(`User visited bugs: ${visitedBugs}`)

    const bug = bugService.getById(bugId)
    res.json(bug)
})

app.get('/api/bug/download/pdf', async (req, res) => {
    const bugs = await bugService.query()

    const doc = new PDFDocument()
    res.setHeader('Content-Type', 'application/pdf')
    doc.pipe(res)

    doc.fontSize(25).text('Bug Report', { align: 'center' })
    bugs.forEach((bug) => {
        doc
            .fontSize(14)
            .text(`Bug ID: ${bug._id}`, { continued: true })
            .text(` | Title: ${bug.title}`)
            .moveDown(0.5)
    })

    doc.end()
})