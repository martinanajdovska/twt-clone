import React from 'react'
import Profile from '../../../../components/Profile'

const Profile = async ({ params }: { params: Promise<{ username: string }> }) => {
    const { username } = await params;

    return (
        <div>
            <Profile username={username}/>
        </div>
    )
}
export default Profile
