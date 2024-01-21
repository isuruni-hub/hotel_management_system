import {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {useSelector} from 'react-redux';
import {selectAuthUser} from '../../app/auth/authSlice';

import{Row, Col, ListGroup, Alert, Badge} from 'react-bootstrap';
import moment from 'moment';

const SingleBookingView = () => {

    const [booking, setBooking] = useState({});
    const navigate = useNavigate();
    const {bookingId} = useParams();
    const axiosPrivate = useAxiosPrivate();
    const {role} = useSelector(selectAuthUser);

    useEffect(() => {
        const getSingleBooking = async () => {
            try {
                const response = await axiosPrivate.get(`/api/rooms/bookings/${bookingId}`);
                setBooking(response.data.booking);
            } catch (err) {
                console.log(err);
                navigate('/dash/my-bookings');
            }
        }
        getSingleBooking();
    }, [axiosPrivate, bookingId, navigate]);

    return (
        <>
            <Row>
                <Col md={12} className='d-flex justify-content-end'>
                    <button className='btn btn-primary' onClick={() => navigate(-1)}>Go Back</button>
                </Col>
            </Row>

            <hr></hr>

            <Row>
                <Col md={12}>
                    <Alert variant='info'>Booking No.{booking?.id} Details</Alert>
                </Col>
            </Row>

            {booking.id && (
                <Row>

                    <Col md={7}>
                        <ListGroup>
                            <ListGroup.Item>
                                <Row>
                                    <Col md={6}>#Booking ID</Col>
                                    <Col md={6}>{booking.id}</Col>
                                </Row>
                            </ListGroup.Item>
                            {(role === 'Employee' || role === 'Admin') && (
                
                                <>
                                    <ListGroup.Item>
                                        <Row>
                                            <Col md={6}>Customer Name</Col>
                                            <Col md={6}>{booking.customerDetails.name}</Col>
                                        </Row>
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <Row>
                                            <Col md={6}>Customer Address</Col>
                                            <Col md={6}>{booking.customerDetails.address}</Col>
                                        </Row>
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <Row>
                                            <Col md={6}>Gender</Col>
                                            <Col md={6}>{booking.customerDetails.gender}</Col>
                                        </Row>
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <Row>
                                            <Col md={6}>Customer Phone No</Col>
                                            <Col md={6}>{booking.customerDetails.phone}</Col>
                                        </Row>
                                    </ListGroup.Item>
                                </>
                            )}

                            <ListGroup.Item>
                                <Row>
                                    <Col md={6}>Booked Date</Col>
                                    <Col md={6}>{moment(booking.createdAt).utc().format('DD MMMM YYYY HH:MM A')}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col md={6}>Check In Date</Col>
                                    <Col md={6}><Badge bg='success'>{moment(booking.checkInDate).utc().format('DD MMMM YYYY')}</Badge></Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col md={6}>Check Out Date</Col>
                                    <Col md={6}><Badge bg='success'>{moment(booking.checkOutDate).utc().format('DD MMMM YYYY')}</Badge></Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col md={6}>Total nights to stay</Col>
                                    <Col md={6}><Badge bg='primary'>{booking.totalNightsStay}</Badge></Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col md={6}>Total rooms booked</Col>
                                    <Col md={6}><Badge bg='dark'>{booking.totalRoomsBooked}</Badge></Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col md={6}>Payment Type</Col>
                                    <Col md={6}><Badge bg={booking.paymentType === 'full' ? 'success' : 'warning'}>{booking.paymentType}</Badge></Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col md={6}>Payment Completion Status</Col>
                                    <Col md={6}><Badge bg={booking.isPaid === 'yes' ? 'success' : 'warning'}>{booking.isPaid === 'yes' ? 'completed' : 'partially completed'}</Badge></Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col md={6}>Total booking price</Col>
                                    <Col md={6}>${booking.totalPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col md={6}>Total paid amount</Col>
                                    <Col md={6}>${booking.totalPaidPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            {booking.paymentType === 'half' && (
                                <ListGroup.Item>
                                    <Row>
                                        <Col md={6}>Remaining Balance</Col>
                                        <Col md={6}><Badge bg='warning'>${booking.remainBalance}</Badge></Col>
                                    </Row>
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Col>

                    <Col md={5}>
                        <ListGroup>
                            <ListGroup.Item>
                                <Row>
                                    <Col md={12}><h4>Room Details</h4></Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col md={6}>Room Type</Col>
                                    <Col md={6}>{booking.bookedRoomType.name}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col md={6}>Room No's</Col>
                                    <Col md={6} className='d-flex flex-wrap align-items-center gap-2'>
                                        {booking.bookedRooms.map(item => (
                                            <Badge key={item.roomNo} bg='info'>{item.roomNo}</Badge>
                                        ))}
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col md={12} className='d-flex align-items-center justify-content-center'><button className='btn btn-primary' onClick={() => navigate(`/dash/rooms/${booking.bookedRoomType.id}`)}>See more about room</button></Col>
                                </Row>
                            </ListGroup.Item>
                        </ListGroup>

                        {booking.paymentType === 'half' && (
                            <Row className='mt-3'>
                                <Col md={12}>
                                    <ListGroup>
                                        <ListGroup.Item>
                                            <Row>
                                                <Col md={12}><h4>Pay Balance</h4></Col>
                                            </Row>
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <Row>
                                                <Col md={12}>
                                                    <PayPalScriptProvider options={{ "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID}}>
                                                        <PayPalButtons 
                                                            style={{ layout: "horizontal" }}
                                                            createOrder={(data, actions) => {
                                                                
                                                                return actions.order.create({
                                                                    purchase_units: [
                                                                        {
                                                                            amount: {
                                                                                value: booking.remainBalance
                                                                            },
                                                                        },
                                                                    ],
                                                                });
                                                            }}
                                                            onApprove={(data, actions) => {
                                                                return actions.order.capture().then((details) => {
                                                                    alert('paid balance successfully');
                                                                });
                                                            }}
                                                        />
                                                    </PayPalScriptProvider>
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Col>
                            </Row>
                        )}

                    </Col>

                </Row>
            )}
        </>
    );
}

export default SingleBookingView;