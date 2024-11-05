import React from 'react'
import './Contact.css'
import msg_icon from '../../assets/msg.png'
import mail_icon from '../../assets/gmail.png'
import phone_icon from '../../assets/phone.png'
import loc_icon from '../../assets/loc.png'

const Contact = () => {
  return (
    <div className='contact'>
<div className='contact-col'>
    <h3>Send Us A Message<img src={msg_icon} alt='' /></h3>
    <p>For inquiries, please visit the City Agriculture Office - Panabo City.</p>
    <ul>
        <li><img src={mail_icon} alt='' />cagropanabocity114@gmail.com</li>
        <li><img src={phone_icon} alt='' />(084) 823-5641</li>
        <li><img src={loc_icon} alt='' />J.P Laurel St., Panabo City, Davao del Norte</li>
    </ul>
</div>
    </div>
  )
}

export default Contact