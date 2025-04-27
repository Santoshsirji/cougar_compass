import React from 'react'

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='pt-20'>
      {children}
    </div>
  )
}

export default ProfileLayout
