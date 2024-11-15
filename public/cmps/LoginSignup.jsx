const { useState } = React

import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'
import { userService } from '../services/user.service.js'

export function LoginSignup({ setUser }) {
    const [isSignup, setIsSignup] = useState(false)
    const [credentials, setCredentials] = useState(userService.getEmptyCredentials())

    function handleChange({ target }) {
        const { name, value } = target
        setCredentials(prevCredentials => ({ ...prevCredentials, [name]: value }))
    }

    function onSubmit(event) {
        event.preventDefault()
        isSignup ? signup(credentials) : login(credentials)
    }

    function login(credentials) {
        userService.login(credentials)
            .then(user => {
                setUser(user)
                showSuccessMsg('Logged in successfully')
            })
            .catch(err => {
                console.error('Login error:', err)
                showErrorMsg('Oops, try again')
            })
    }

    function signup(credentials) {
        userService.signup(credentials)
            .then(user => {
                setUser(user);
                showSuccessMsg('Signed up successfully')
            })
            .catch(err => {
                console.error('Signup error:', err)
                showErrorMsg('Oops, try again')
            })
    }


    return (
        <div className="auth-container">
            <h2>{isSignup ? 'Signup' : 'Login'}</h2>
            <form onSubmit={onSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={credentials.username}
                    onChange={handleChange}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={handleChange}
                />
                {isSignup && (
                    <input
                        type="text"
                        name="fullname"
                        placeholder="Full Name"
                        value={credentials.fullname}
                        onChange={handleChange}
                    />
                )}
                <button>{isSignup ? 'Signup' : 'Login'}</button>
            </form>
            <div className="button-container">
                <button onClick={() => setIsSignup(!isSignup)}>
                    {isSignup ? 'Switch to Login' : 'Switch to Signup'}
                </button>
            </div>
        </div >
    )
}
