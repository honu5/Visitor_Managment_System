import React from 'react'
export default function Card({children,title}){
  return (
    <div className="card">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  )
}
