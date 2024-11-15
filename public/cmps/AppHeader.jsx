const { NavLink, useNavigate } = ReactRouterDOM
const { useState } = React

import { UserMsg } from './UserMsg.jsx'
import { LoginSignup } from './LoginSignup.jsx'
import { userService } from '../services/user.service.js'

export function AppHeader() {
    const [user, setUser] = useState(userService.getLoggedinUser())
    const navigate = useNavigate()

    function handleLogout() {
        userService.logout().then(() => {
            setUser(null)
            navigate('/')
        }).catch((err) => {
            console.error('Error during logout:', err)
        })
    }

    return (
        <React.Fragment>
            <header className='container'>
                {!user && <LoginSignup setUser={setUser} />}
                {user && (
                    <div className="nav-bar-container flex space-between">
                        <nav className="nav-bar">
                            <NavLink to="/bug">Bugs</NavLink>
                            {user && <NavLink to="/user">Profile</NavLink>}
                            {user && user.isAdmin && <NavLink to="/admin">Admin</NavLink>}
                            <NavLink to="/about">About</NavLink>
                        </nav>
                        <div>
                            <p>Hello {user.fullname}</p>
                            <button className="btn" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </header>
            <UserMsg />
        </React.Fragment>
    )
}


