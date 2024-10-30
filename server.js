import express from 'express'
import cookieParser from 'cookie-parser'
import { bugService } from './bug.service.js'
import PDFDocument from 'pdfkit'

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

app.get('/api/bug/download/pdf', (req, res) => {
    const doc = new PDFDocument()
    let filename = 'bugs.pdf'
    res.setHeader('Content-disposition', `attachment; filename=${filename}`)
    res.setHeader('Content-type', 'application/pdf')

    doc.text('Bug List:', { align: 'center' })
    bugs.forEach(bug => {
        doc.text(`Title: ${bug.title}, Severity: ${bug.severity}`)
    })

    doc.pipe(res)
    doc.end()
})