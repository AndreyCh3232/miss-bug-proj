const { Link } = ReactRouterDOM

import { BugPreview } from './BugPreview.jsx'

export function BugList({ bugs, onRemoveBug, onEditBug }) {

    if (!bugs) return <div>Loading...</div>

    const validBugs = bugs.filter(bug => bug && bug._id)

    return (
        <ul className="bug-list">
            {validBugs.map((bug) => (
                <li className="bug-preview" key={bug._id}>
                    <BugPreview bug={bug} />
                    <div>
                        <button onClick={() => onRemoveBug(bug._id)}>Delete</button>
                        <button onClick={() => onEditBug(bug)}>Edit</button>
                    </div>
                    <Link to={`/bug/${bug._id}`}>Details</Link>
                </li>
            ))
            }
        </ul >
    )
}
