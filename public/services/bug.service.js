
export const bugService = {
  query,
  save,
  remove,
  save,
  getById,
  getDefaultFilter,
  downloadPdf
}

const BASE_URL = '/api/bug/'

function query(filterBy = {}) {
  return axios
    .get(BASE_URL)
    .then((res) => res.data)
    .then((bugs) => {
      let filteredBugs = bugs
      if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        filteredBugs = filteredBugs.filter((bug) => regExp.test(bug.title))
      }
      if (filterBy.minSeverity) {
        filteredBugs = filteredBugs.filter((bug) => bug.severity >= filterBy.minSeverity)
      }
      return filteredBugs
    })
}

function getById(bugId) {
  return axios
    .get(`${BASE_URL}${bugId}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`Error getting bug with ID ${bugId}:`, err)
      throw err
    })
}

function remove(bugId) {
  return axios
    .delete(`${BASE_URL}${bugId}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(`Error removing bug with ID ${bugId}:`, err)
      throw err
    })
}

function save(bug) {
  if (bug._id) {
    return axios
      .put(`${BASE_URL}${bug._id}`, bug)
      .then((res) => res.data)
      .catch((err) => {
        console.error('Error updating bug:', err)
        throw err;
      })
  } else {
    return axios
      .post(BASE_URL, bug)
      .then((res) => res.data)
      .catch((err) => {
        console.error('Error adding new bug:', err)
        throw err
      })
  }
}

function getDefaultFilter() {
  return { txt: '', minSeverity: 0 }
}

function downloadPdf() {
  axios({
    url: '/api/bug/pdf',
    method: 'GET',
    responseType: 'blob'
  })
    .then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))

      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'bugs.pdf')
      document.body.appendChild(link)
      link.click()

      link.remove()
      window.URL.revokeObjectURL(url)
    })
    .catch((error) => {
      console.error('Error downloading PDF:', error)
    })
}
