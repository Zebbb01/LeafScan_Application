import { useState } from 'react'
import './Collections.css'
import collection_1 from '../../assets/collection-1.png'
import collection_2 from '../../assets/collection-2.jpg'
import collection_3 from '../../assets/collection-3.png'
import collection_4 from '../../assets/collection-4.jpg'

const preventionData = {
  "Leaf Spot": "To prevent Leaf Spot, ensure proper spacing between plants to allow air circulation, avoid overhead watering, and remove any affected leaves.",
  "Early Blight": "Early Blight can be prevented by rotating crops, using resistant varieties, and applying fungicides as needed.",
  "Late Blight": "Prevent Late Blight by using certified disease-free seeds, removing infected plants, and applying fungicides before wet weather.",
  "VSD": "Prune affected branches and apply fungicide sprays regularly."
}

const Collections = () => {
  const [selectedDisease, setSelectedDisease] = useState(null)

  const handleClose = () => {
    setSelectedDisease(null)
  }

  return (
    <div className='collections'>
      <div className='collection' onClick={() => setSelectedDisease('Leaf Spot')}>
        <img src={collection_1} alt='Leaf Spot' />
        <div className='caption'>
          <p>Leaf Spot</p>
        </div>
      </div>   
      <div className='collection' onClick={() => setSelectedDisease('Early Blight')}>
        <img src={collection_2} alt='Early Blight' />
        <div className='caption'>
          <p>Early Blight</p>
        </div>
      </div>
      <div className='collection' onClick={() => setSelectedDisease('Late Blight')}>
        <img src={collection_3} alt='Late Blight' />
        <div className='caption'>
          <p>Late Blight</p>
        </div>
      </div>
      <div className='collection' onClick={() => setSelectedDisease('VSD')}>
        <img src={collection_4} alt='VSD' />
        <div className='caption'>
          <p>VSD</p>
        </div>
      </div>

      {selectedDisease && (
        <div className="modal">
          <div className="modal-overlay" onClick={handleClose}></div>
          <div className="modal-content">
            <h1>{selectedDisease}</h1>
            <h3>Prevention</h3>
            <p>{preventionData[selectedDisease]}</p>
            <button className="modal-close-button" onClick={handleClose}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Collections
