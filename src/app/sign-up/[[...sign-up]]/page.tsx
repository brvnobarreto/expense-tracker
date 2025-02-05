import { SignUp } from '@clerk/nextjs'


export default function Page() {
  return (
    <div className='flex justify-center items-center min-h-screen bg-gradient-to-b from-teal-800 to-white'>
        <SignUp/>
    </div>
  )
}