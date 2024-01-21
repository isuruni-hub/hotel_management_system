import {useState, useEffect, Suspense} from 'react';
import {useSelector} from 'react-redux';
import {selectAuthUser} from '../../app/auth/authSlice';
import moment from 'moment';

import '../../styles/welcome.css';
import PopularFoodCategory from '../../components/charts/PopularFoodCategory';
import BookingsMonthlyReport from '../../components/charts/BookingsMonthlyReport';

const Welcome = () => {

    const user = useSelector(selectAuthUser);

    const [timestamp, setTimestamp] = useState(moment().format('LTS'));

    useEffect(() => {
        const timerId = setInterval(() => {
            setTimestamp(moment().format('LTS'));
        }, 1000)

        return () => clearInterval(timerId);
    }, []);

    return (
        <div>
            <div className="dashboard-welcome-box">
                <h1>Welcome, <span>{user.username}</span></h1>
                <h6>{moment().format('MMMM Do YYYY')} , {moment().format('dddd')}</h6>
                <p className='welcome-box-current-time'>{timestamp}</p>
                <div className='welcome-box-img'>
                    <img src='/img/welcome.png' alt='welcome' />
                </div>
            </div>

            {/* Reports Charts  */}
            {user && user.role === 'Admin' && (
                <>
                    <Suspense fallback={<p>Loading...</p>}>
                        <PopularFoodCategory />
                    </Suspense>
                    <Suspense fallback={<p>Loading...</p>}>
                        <BookingsMonthlyReport />
                    </Suspense>
                </>
            )}
            
            
        </div>
    );
}

export default Welcome;