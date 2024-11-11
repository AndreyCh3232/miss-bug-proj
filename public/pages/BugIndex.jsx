import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'
import { BugFilter } from '../cmps/BugFilter.jsx'

const { useState, useEffect } = React

export function BugIndex() {
  const [bugs, setBugs] = useState(null)
  const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())
  const [sortBy, setSortBy] = useState('title')
  const [pageIdx, setPageIdx] = useState(0)
  const pageSize = 5

  useEffect(() => {
    loadBugs()
  }, [filterBy, sortBy, pageIdx])

  function loadBugs() {
    bugService
      .query({ ...filterBy, sortBy, pageIdx, pageSize })
      .then(setBugs)
      .catch((err) => {
        showErrorMsg('cant load bugs')
        console.error('Error loading bugs:', err)
      })
  }

  function onRemoveBug(bugId) {
    bugService
      .remove(bugId)
      .then(() => {
        const bugsToUpdate = bugs.filter((bug) => bug._id !== bugId)
        setBugs(bugsToUpdate)
        showSuccessMsg('Bug removed successfully')
      })
      .catch((err) => {
        console.log('Error removing bug', err)
        showErrorMsg('Cannot remove bug')
      })
  }

  function onAddBug() {
    const bug = {
      title: prompt('Bug title?'),
      severity: +prompt('Bug severity?'),
    }
    bugService
      .save(bug)
      .then((savedBug) => {
        setBugs((prevBugs) => [...bugs, savedBug])
        showSuccessMsg('Bug added successfully')
      })
      .catch((err) => {
        console.log('Error adding bug:', err)
        showErrorMsg('Cannot add bug')
      })
  }

  function onEditBug(bug) {
    const severity = +prompt('New severity?', bug._id ? bug.severity : '')
    const description = prompt('Edit Desctiption', bug._id ? bug.description : '')
    const bugToSave = { ...bug, severity, description }
    bugService
      .save(bugToSave)
      .then((savedBug) => {
        console.log('Updated Bug:', savedBug)
        const bugsToUpdate = bugs.map((currBug) => (currBug._id === savedBug._id ? savedBug : currBug))
        setBugs(bugsToUpdate)
        showSuccessMsg('Bug updated successfully')
      })
      .catch((err) => {
        console.log('Error updating bug:', err)
        showErrorMsg('Cannot update bug')
      })
  }

  function onDownloadPdf() {
    bugService
      .downloadPdf()
      .then(() => {
        showSuccessMsg('PDF downloaded')
      })
      .catch((err) => {
        console.error('Error downloading PDF:', err)
        showErrorMsg('Failed to generate PDF')
      })
  }

  function onSetFilterBy(newFilterBy) {
    setFilterBy((prevFilterBy) => ({ ...prevFilterBy, ...newFilterBy }))
  }

  function onSortChange(e) {
    setSortBy(e.target.value)
  }

  function onNextPage() {
    setPageIdx((prevPageIdx) => prevPageIdx + 1)
  }

  function onPrevPage() {
    setPageIdx((prevPageIdx) => Math.max(prevPageIdx - 1, 0))
  }

  return (
    <main>
      <section className="info-actions">
        <h3>Bugs App</h3>
        <BugFilter filterBy={filterBy} onSetFilterBy={onSetFilterBy} />
        <label>
          Sort by:
          <select value={sortBy} onChange={onSortChange}>
            <option value="title">Title</option>
            <option value="severity">Severity</option>
            <option value="createdAt">Created At</option>
          </select>
        </label>
        <button onClick={onAddBug}>Add Bug</button>
        <button onClick={onDownloadPdf}>Download PDF</button>
      </section>
      <main>
        <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
        <div className="pagination">
          <button onClick={onPrevPage} disabled={pageIdx === 0}>
            Previous
          </button>
          <span>Page {pageIdx + 1}</span>
          <button onClick={onNextPage} disabled={!bugs || bugs.length < pageSize}>
            Next
          </button>
        </div>
      </main>
    </main>
  )
}
