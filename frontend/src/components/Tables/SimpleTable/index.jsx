import React from 'react'

export default function SimpleTable({columns = [], data = []}){
  return (
    <div className="card">
      <table className="table simple-table">
        <thead>
          <tr>{columns.map(c=>(<th key={c}>{c}</th>))}</tr>
        </thead>
        <tbody>
          {(data||[]).map((row,i)=>(
            <tr key={i}>
              {columns.map(c=>(<td key={c}>{row?.[c] ?? row[c.toLowerCase()] ?? ''}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
