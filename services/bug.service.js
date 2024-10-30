import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'

const STORAGE_KEY = 'bugDB'

_createBugs()

export const bugService = {
    query,
    getById,
    save,
    remove,
}


function query() {
    return storageService.query(STORAGE_KEY)
}
function getById(bugId) {
    return storageService.get(STORAGE_KEY, bugId)
}

function remove(bugId) {
    return storageService.remove(STORAGE_KEY, bugId)
}

function save(bug) {
    if (bug._id) {
        return storageService.put(STORAGE_KEY, bug)
    } else {
        return storageService.post(STORAGE_KEY, bug)
    }

}

function _createBugs() {
    let bugs = utilService.loadFromStorage(STORAGE_KEY)
    if (!bugs || !bugs.length) {
        bugs = [
            {
                _id: 'b101',
                title: "Infinite Loop Detected",
                description: "Occurs when function calls itself infinitely.",
                severity: 4,
                createdAt: Date.now(),
            },
            {
                _id: 'b102',
                title: "Keyboard Not Found",
                description: "This issue arises when the computer can't find the keyboard.",
                severity: 3,
                createdAt: Date.now(),
            },
            {
                _id: 'b103',
                title: "404 Coffee Not Found",
                description: "Coffee not available, perhaps a missing coffee machine?",
                severity: 2,
                createdAt: Date.now(),
            },
            {
                _id: 'b104',
                title: "Unexpected Response",
                description: "Received an unexpected response from the server.",
                severity: 1,
                createdAt: Date.now(),
            }
        ]
        utilService.saveToStorage(STORAGE_KEY, bugs)
    }



}
