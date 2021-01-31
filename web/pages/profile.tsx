// pages/profile.js
import { useState, useEffect } from 'react'
import { Auth } from 'aws-amplify'
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
import Amplify from 'aws-amplify'
import awsConfig from '../aws-exports'
Amplify.configure({...awsConfig});


function Profile() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    // Access the user session on the client
    Auth.currentAuthenticatedUser()
      .then(user => {
        setUser(user)
      })
      .catch(err => setUser(null))
  }, [])
  return (
    <div>
      { user && <h1>Welcome, {user.username}</h1> }
      <AmplifySignOut />
    </div>
  )
}

export default withAuthenticator(Profile)