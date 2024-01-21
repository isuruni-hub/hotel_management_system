

import {MdExpandMore} from 'react-icons/md';
import {Badge} from 'react-bootstrap';
import { useState } from 'react';
import {useSelector} from 'react-redux';
import {selectAuthUser} from '../../../app/auth/authSlice';

const EventOrderItem = ({order}) => {

    const [isExpanded, setIsExpanded] = useState(false);
    const {role} = useSelector(selectAuthUser);
    
    return (
        <div className='mb-5 shadow'>
        <div className=" d-flex align-items-center px-4 py-3">
            <p style={{width: '18%', margin: 0}} className="d-flex flex-column gap-2" >
                <span style={{fontSize: '14px', fontWeight: 500}}>Order ID</span>
                <span>{order.id}</span>
            </p>
            {(role === 'Employee' || role === 'Admin') && (
                <>
                    <p style={{width: '18%', margin: 0}} className="d-flex flex-column gap-2" >
                        <span style={{fontSize: '14px', fontWeight: 500}}>Customer Name</span>
                        <span>{order.name}</span>
                    </p>
                    <p style={{width: '18%', margin: 0}} className="d-flex flex-column gap-2" >
                        <span style={{fontSize: '14px', fontWeight: 500}}>Customer Address</span>
                        <span>{order.address}</span>
                    </p>
                    <p style={{width: '18%', margin: 0}} className="d-flex flex-column gap-2" >
                        <span style={{fontSize: '14px', fontWeight: 500}}>Phone No</span>
                        <span>{order.phone}</span>
                    </p>
                </>
            )}   
            <p style={{width: '18%', margin: 0}} className="d-flex flex-column gap-2">
                <span style={{fontSize: '14px'}}>Created At</span>
                <span style={{fontSize: '12px'}}>{new Date(order.createdAt).toDateString()}</span>
            </p>
            <p style={{width: '18%', margin: 0}} className="d-flex flex-column gap-2">
                <span style={{fontSize: '14px'}}>Total Booked Events</span>
                <span>{order.totalNumOfEvents}</span>
                
            </p>
            <p style={{width: '18%', margin: 0}} className="d-flex flex-column gap-2">
                <span style={{fontSize: '14px'}}>Order Total (USD)</span>
                <span>${order.total}</span>
                
            </p>
            <p style={{width: '18%', margin: 0}} className="d-flex flex-column gap-2">
                <span style={{fontSize: '14px'}}>Paid Status</span>
                <span>{order.isPaid}</span>
                
            </p>
            <p style={{width: '10%', margin: 0}}>
                <button style={{cursor: 'pinter', background: 'transparent', border: 'none'}} onClick={() => setIsExpanded(prev => !prev)} ><MdExpandMore size={25} /></button>
            </p>
        </div>
            {isExpanded && (
                <div className='p-3 shadow'>
                    {order.items.map(item => (
                        <div className='mb-3 d-flex align-items-start gap-5'>
                            <div>
                                <img src={item.image} alt={item.eventId} width={150} height={100} style={{objectFit: 'cover'}} />
                            </div>
                            <div>
                                <h4>{item.name}</h4>
                                <Badge bg="info">{item.type} event</Badge>
                                <p className='my-3'>Total people : {item.totalPeople}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        
        </div>
    );
}

export default EventOrderItem;