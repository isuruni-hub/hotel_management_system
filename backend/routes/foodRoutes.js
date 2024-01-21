const express = require('express');
const router = express.Router();

const {auth, isEmployee} = require('../middleware/auth');

router.use(auth);

const {createNewMenu, getAllMenus, deleteMenu, getSingleMenu, updateSingleMeal, getSingleMenuUser, createNewOrder, getAllFoodOrdersOfCustomer, getPopularCategories} = require('../controllers/foodControllers');

router.route('/')
    .get(getAllMenus)
    .post(isEmployee, createNewMenu)

router.route('/order')
    .post(createNewOrder) // place a new food order

router.route('/order/customer/:id')
    .get(getAllFoodOrdersOfCustomer);    

router.route('/popular-categories')
    .get(isEmployee, getPopularCategories)

router.route('/user/:menuId')
    .get(getSingleMenuUser)

router.route('/:menuId')
    .get(getSingleMenu)
    .delete(isEmployee, deleteMenu)



router.route('/meal/update')
    .put(isEmployee, updateSingleMeal)


module.exports = router;