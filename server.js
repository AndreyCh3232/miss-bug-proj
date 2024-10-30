import express from 'express'
import cookieParser from 'cookie-parser'
import { bugService } from './services/bug.service.js'
import PDFDocument from 'pdfkit'

const app = express()

app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())

app.get('/api/bug', (req, res) => {
    bugService.query().then(bugs => res.send(bugs))
})

app.post('/api/bug/save', (req, res) => {
    const bug = req.body
    bugService.save(bug)
        .then(savedBug => res.send(savedBug))
        .catch(err => res.status(500).send('Cannot save bug'))
})

app.delete('/api/bug/:bugId/remove', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => res.send('Bug removed'))
        .catch(err => res.status(500).send('Cannot remove bug'))
})


app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    let visitedBugs = req.cookies.visitedBugs || []

    if (!visitedBugs.includes(bugId)) {
        visitedBugs.push(bugId)
        if (visitedBugs.length > 3) {
            return res.status(401).send('Wait for a bit')
        }
        res.cookie('visitedBugs', visitedBugs, { maxAge: 7000 })
    }

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => res.status(404).send('Bug not found'))
})

app.get('/api/bug/download', (req, res) => {
    const doc = new PDFDocument()
    let filename = 'bugs_report.pdf'

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-type', 'application/pdf')

    doc.fontSize(18).text('Bugs Report', { align: 'center' })
    bugService.query().then(bugs => {
        bugs.forEach(bug => {
            doc.fontSize(12).text(`Title: ${bug.title}`)
            doc.text(`Description: ${bug.description}`)
            doc.text(`Severity: ${bug.severity}`)
            doc.text(`Created At: ${new Date(bug.createdAt).toLocaleString()}`)
            doc.moveDown()
        })
        doc.pipe(res)
        doc.end()
    })
})

const port = 3030
app.get('/', (req, res) => res.send('Hello there'))
app.listen(port, () =>
    console.log(`Server listening on http://127.0.0.1:${port}/`)
)
