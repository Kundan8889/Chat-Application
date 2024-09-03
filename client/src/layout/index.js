// import React from 'react'
// import logo from '../assets/logo.png'

// const AuthLayouts = ({children}) => {
//   return (
//     <>
//         <header className='flex justify-center items-center py-3 h-20 shadow-md bg-white'>
//             <img 
//               src={logo}
//               alt='logo'
//               width={180}
//               height={60}
//             />
//         </header>

//         { children }
//     </>
//   )
// }

// export default AuthLayouts
import React from 'react'
import logo from '../assets/logo.png'

const AuthLayouts = ({children}) => {
  return (
    <>
        <div>
        <header className='flex justify-center items-center py-3 h-20 shadow-md bg-white'>
        <img 
              src={logo}
              alt='logo'
              width={100}
              height={30}
            />
             </header>
        </div>
        { children }
    </>
  )
}

export default AuthLayouts