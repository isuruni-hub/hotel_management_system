import {useState, useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import {Spinner} from 'react-bootstrap';
import EventOrderItem from './components/EventOrderItem';
import {useSelector} from 'react-redux';
import {selectAuthUser} from '../../app/auth/authSlice';
const EventOrders = () => {

    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();

    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);

    const {role, id} = useSelector(selectAuthUser);
    useEffect(() => {
        const getMyEventOrders = async () => {
            try {
                const response = await axiosPrivate.get(`/api/events/order/customer/${id}?role=${role}`);
                console.log(response.data);
                setOrders(response.data.orders);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        }
        getMyEventOrders();
    }, [axiosPrivate,role,id]);


    return (
        <>
            <div className='d-flex align-items-center justify-content-between'>
                {role === 'Customer' && (
                    <h1>My Event Orders</h1>
                )}
                {(role === 'Employee' || role === 'Admin') && (
                    <h1>Event Orders</h1>
                )}

                <button className="btn btn-primary" onClick={() => navigate(-1)} >Go Back</button>
            </div>
            <hr></hr>

            {loading && (
                <div className='d-flex flex-column gap-2 justify-content-center align-items-center'>
                    <Spinner
                        as="span"
                        animation="grow"
                        size="xl"
                        role="status"
                        aria-hidden="true"
                        
                        style={{marginTop: '250px'}}
                    />
                    <small>loading...</small>
                </div>
            )}

            {!loading && (
                orders.length === 0 ? (
                    <p>No Orders</p>
                ) : (
                    <>
                        {orders.map(o => (<EventOrderItem key={o.id} order={o}/>))}
                    </>
                )
            )}

        </>
    );
}

export default EventOrders;