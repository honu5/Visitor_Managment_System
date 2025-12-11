import React from 'react'
export default function SimpleTable({columns,data=[]}){
  return (
    <table className="table">
      <thead>
        <tr>{columns.map(c=><th key={c}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {data.map((row,i)=>(
          <tr key={i}>{columns.map(col=><td key={col}>{row[col] ?? ''}</td>)}</tr>
        ))}
      </tbody>
    </table>
  )
}
