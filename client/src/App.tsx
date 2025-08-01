import '@/App.css'
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='navBar'>
        <h1>Sample Navbar text</h1>
      </div>
      <div className='mainContent'>
        {/* <h1>This is the main content</h1> */}
      </div>

      <h1>This is h1- Customer Information</h1>
      <h2>This is h2</h2>
      <h3>This is h3</h3>
      <h4>This is h4</h4>
      <h5>This is h5</h5>
      <h6>This is h6</h6>
      <p>Edit <code>src/App.tsx</code> and save to test HMR</p>
      
      <div className="card">
        <label>Label</label>
        <input/>
      </div>

      <div className="card">
        <label>Label</label>
        <select>
          <option value="">option1</option>
        </select>
      </div>

      <div className="card">
        <button className="button-md" onClick={() => setCount((count) => count + 1)}>
          Edit
        </button>
      </div>
    </>
  )
}

export default App
