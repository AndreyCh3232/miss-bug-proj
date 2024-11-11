import express from 'express'
import cookieParser from 'cookie-parser'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import PDFDocument from 'pdfkit'

const app = express()

app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())

// Retrieve bugs with filtering, sorting, and pagination
app.get('/api/bug', (req, res) => {
    const { sortBy, sortDir = 1, pageIdx = 0, pageSize = 5, txt, minSeverity, labels } = req.query

    bugService.query({ sortBy, sortDir, pageIdx, pageSize, txt, minSeverity, labels })
        .then(bugs => res.json(bugs))
        .catch(err => {
            loggerService.error('Failed to query bugs', err)
            res.status(500).send('Cannot get bugs')
        })
})

// Retrieve bug by ID with limited view tracking
app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    let visitedBugs = req.cookies.visitedBugs || []

    if (!visitedBugs.includes(bugId)) {
        visitedBugs.push(bugId)
        if (visitedBugs.length > 3) {
            loggerService.warn(`User visited more than 3 bugs: ${visitedBugs}`)
            return res.status(401).send('Wait for a bit')
        }
        res.cookie('visitedBugs', visitedBugs, { maxAge: 7000 })
    }

    bugService.getById(bugId)
        .then(bug => res.json(bug))
        .catch(err => {
            loggerService.error(`Bug not found with ID: ${bugId}`, err)
            res.status(404).send('Bug not found')
        })
})

// Create or update a bug
app.post('/api/bug', (req, res) => {
    const bug = req.body
    bugService.save(bug)
        .then(savedBug => res.json(savedBug))
        .catch(err => {
            loggerService.error('Failed to save bug', err)
            res.status(500).send('Cannot save bug')
        })
})

app.put('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    const bug = req.body
    bugService.save({ ...bug, _id: bugId })
        .then(updatedBug => res.json(updatedBug))
        .catch(err => {
            loggerService.error('Failed to update bug', err)
            res.status(500).send('Cannot update bug')
        })
})

// Delete a bug
app.delete('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => res.send('Bug removed'))
        .catch(err => {
            loggerService.error(`Failed to remove bug with ID: ${req.params.bugId}`, err)
            res.status(500).send('Cannot remove bug')
        })
})

// Auth API
app.post('/api/auth/signup', (req, res) => {
    const { username, password, fullname } = req.body
    userService.signup(username, password, fullname)
        .then(user => res.json(user))
        .catch(err => res.status(500).send('Failed to signup'))
})

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body
    userService.login(username, password)
        .then(user => {
            res.cookie('loginToken', user._id, { httpOnly: true })
            res.json({ _id: user._id, fullname: user.fullname })
        })
        .catch(() => res.status(401).send('Invalid username or password'))
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('Logged out')
})

// Download bug report as PDF
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
        .catch(err => {
            loggerService.error('Failed to generate PDF report', err)
            res.status(500).send('Failed to generate PDF')
        })
})

const port = 3030
app.get('/', (req, res) => res.send('Hello there'))
app.listen(port, () =>
    console.log(`Server listening on http://127.0.0.1:${port}/`)
)
