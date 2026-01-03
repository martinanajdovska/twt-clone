import React from 'react'
import User from '../../../../components/User'

const Profile = async ({ params }: { params: Promise<{ username: string }> }) => {
    const { username } = await params;

    return (
        <div>
            <User username={username}/>
        </div>
    )
}
export default Profile
