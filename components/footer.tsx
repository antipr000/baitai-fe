import Image from 'next/image'
import React from 'react'

export const Footer = () => {
  return ( <section className="w-full   px-0 lg:py-10 md:py-8 py-8">
           <div className="w-full">
             <div className="flex flex-col items-center text-center gap-6">
               <div className="flex items-center space-x-2 mb-2">
                 <Image className="lg:size-[34px] size-5" src="/main/logo.png" alt="Bait AI Logo" width={40} height={40} />
                 <span className="lg:text-3xl text-xl font-bold bg-clip-text text-transparent bg-[linear-gradient(106.63deg,rgba(16,81,171,1)_0%,rgba(28,15,111,1)_144.25%)]">bAIt</span>
               </div>
               <div className="flex items-center space-x-6">
                 <Image className="md:size-6 lg:[size-30px] size-5" src="/main/linkedin.svg" alt=" Linkedin Logo" width={30} height={30} />
                 <Image className="md:size-6 lg:[size-30px] size-5" src="/main/gmail.svg" alt="Gmail Logo" width={30} height={30} />
                 <Image className="bg-black  md:size-5 lg:[size-26px] size-4 p-1" src="/main/x.svg" alt="X Logo" width={26} height={26} />
                 <Image className="md:size-6 lg:[size-30px] size-5" src="/main/instagram.svg" alt="Instagram Logo" width={30} height={30} />
                 <Image className="md:size-6 lg:[size-30px] size-5" src="/main/facebook.svg" alt="Facebook Logo" width={30} height={30} />
               </div>
 
               <div className="text-primary lg:text-base text-xs  md:text-sm">
                 Copyright © 2025 Bait AI | All Rights Reserved
               </div>
             </div>
           </div>
         </section>
 
  )
}
