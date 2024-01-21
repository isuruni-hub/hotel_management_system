const db = require('../config/db');

const createNewMenu = async (req, res, next) => {

    const {name, url, categories, meals} = req.body;

    if(!name || !url || meals.length <= 0) return res.status(400).json({message: 'Invalid input data'});

    try {
        const [menu] = await db.query("INSERT INTO menu(name, image) VALUES (?, ?)", [name, url]);
        const menuId = menu.insertId;

        // create categories
        if(!categories && !Array.isArray(categories)) {
            const [cat] = await db.query("INSERT INTO menu_category(menuId, categoryName) VALUES(?, ?)", [menuId, 'no-category']);
            
            // create meals with reference to the menu & category
            const mealsPromises = meals.map(m => {
                return db.query("INSERT INTO menu_category_meal(menuId, categoryId, mealName, price) VALUES(?, ?, ?, ?)", [menuId, cat.insertId, m.name, m.price]);
            })

            await Promise.all(mealsPromises);
            return res.status(201).json({message: 'Menu Created'});
        }

        if(categories.length > 0) {
            const catPromises = categories.map(c => db.query("INSERT INTO menu_category(menuId, categoryName) VALUES(?, ?)", [menuId, c]));
            const result = await Promise.all(catPromises);

            categories.forEach( async (c, i) => {
                const catMeals = meals[c];
                const catId = result[i][0].insertId;

                const mealsPromises = catMeals.map(m => {
                    return db.query("INSERT INTO menu_category_meal(menuId, categoryId, mealName, price) VALUES(?, ?, ?, ?)", [menuId, catId, m.name, m.price]);
                })

                await Promise.all(mealsPromises);
                return res.status(201).json({message: 'Menu Created'});
            })
        }


    } catch (err) {
        next(err);
    }

}

// GET ALL MENU DATA
const getAllMenus = async (req, res, next) => {
    try {
        const [menus] = await db.query("SELECT * FROM menu");

        let menusData = [];

        const result = await Promise.all(menus.map(m => db.query("SELECT id, categoryName FROM menu_category WHERE menuId=?", [m.id])));

        menus.forEach((m, i) => {
            menusData.push({
                ...m,
                categories: result[i][0]
            });
        })

        let updatedMenusData = [];

        menusData.forEach(async (menu) => {
            
            let updatedCategories = [];
            for(let i = 0; i < menu.categories.length; i++) {
                const [result] = await db.query("SELECT COUNT(*) AS total_meals FROM menu_category_meal WHERE menuId=? AND categoryId=?", [menu.id, menu.categories[i].id]);
                updatedCategories.push({...menu.categories[i], totalMeals: result[0].total_meals});
            }

            updatedMenusData.push({
                ...menu,
                categories: updatedCategories
            });

            if(updatedMenusData.length === menusData.length) {
                res.status(200).json({message: 'success', menus: updatedMenusData});
            }
        });


    } catch (err) {
        next(err);
    }
}

// DELETE A MENU COMPLETELY

const deleteMenu = async (req, res, next) => {
    const {menuId} = req.params;

    try {
        const [result] = await db.query("SELECT * FROM menu WHERE id=?", [+menuId]);

        if(result.length === 0) return res.status(400).json({message: 'Invalid menu id'});

        // delete the menu data completely
        await db.query("DELETE FROM menu WHERE id=?", [+menuId]);

        res.status(200).json({message: 'Menu deleted successfully'});
    } catch (err) {
        next(err);
    }
}

// GET SINGLE MENU DATA

const getSingleMenu = async (req, res, next) => {
    const {menuId} = req.params;

    try {
        const [result] = await db.query("SELECT * FROM menu WHERE id=?", [+menuId]);

        if(result.length === 0) return res.status(404).json({message: 'Menu not found with the given id'});

        let menuData = {...result[0]};

        // populate categories and meals for each category
        const [categories] = await db.query("SELECT id, categoryName FROM menu_category WHERE menuId=?", [+menuData.id]);

        menuData.categories = categories;

        const categoriesResult = await Promise.all(categories.map(c => db.query("SELECT * FROM menu_category_meal WHERE menuId=? AND categoryId=?", [+menuData.id, +c.id])));

        const meals = {};

        categories.forEach((c, i) => {
            meals[c.categoryName] = categoriesResult[i][0];
        })

        menuData.meals = meals;

        res.status(200).json({message: 'success', menu: menuData});

    } catch (err) {
        next(err);        
    }

}

const getSingleMenuUser = async (req, res, next) => {

    const {menuId} = req.params;

    try {
        const [menuResult] = await db.query("SELECT id, name, image FROM menu WHERE id=?", [+menuId]);

        // find all the categories of that menu
        const [categoryResult] = await db.query("SELECT id, categoryName FROM menu_category WHERE menuId=?", [+menuId]);

        // populate each category with meals
        const results = await Promise.all(categoryResult.map(cat => db.query("SELECT * FROM menu_category_meal WHERE menuId=? AND categoryId=?", [+menuId, +cat.id])));

        let menu = {
            ...menuResult[0],
            categories: categoryResult.map((cat, i) => ({
                id: cat.id,
                categoryName: cat.categoryName,
                meals: results[i][0]
            }))
        }

        res.status(200).json({message: 'success', menu});

    } catch (err) {
        next(err);        
    }
}


 // UPDATE SINGLE MEAL INFO
const updateSingleMeal = async (req, res, next) => {
    const {menuId, categoryId, mealName, type} = req.body;

    let message = "";
    let status;
    // delete a meal from a menu
    if(type === 'delete') {
        if(!menuId || !categoryId || !mealName || !type) return res.status(400).json({message: 'Invalid Input Data'});
        await db.query("DELETE FROM menu_category_meal WHERE menuId=? AND categoryId=? AND mealName=?", [+menuId, +categoryId, mealName])
        message = "Meal deleted successfully";
        status = 200;
    }

    // create new meal for the menu, under a category
    if(type === 'create') {
        if(!menuId || !categoryId || !mealName || !price || !type) return res.status(400).json({message: 'Invalid Input Data'});
        await db.query("INSERT INTO menu_category_meal(menuId, categoryId, mealName, price) VALUES(?, ?, ?, ?)", [+menuId, +categoryId, mealName, +price]);
        message = "New meal added successfully";
        status = 201;
    }

    res.status(status).json({message});
} 


// create a new food order

const createNewOrder = async (req, res, next) => {
    const {totalPrice, totalItems, orderItems} = req.body;
    const customerId = req.user.id;

    try {
        const [result] = await db.query("INSERT INTO food_order (customerId, totalPrice, totalItems) VALUES(?,?,?)", [+customerId, +totalPrice, +totalItems]);
    
        const orderId = result.insertId;

        // add order items to food_order_item table
        for(let i = 0; i < orderItems.length; i++) {
            await db.query("INSERT INTO food_order_item (orderId, menuId, categoryId, mealName, price, totalPrice, quantity) VALUES (?,?,?,?,?,?,?)", [orderId, orderItems[i].menuId, orderItems[i].categoryId, orderItems[i].mealName, orderItems[i].price, orderItems[i].totalPrice, orderItems[i].quantity]);
        }

        res.status(201).json({message: 'Order created successfully'});

    } catch (err) {
        next(err);
    }
}

const getPopularCategories = async (req, res, next) => {

    try {
        // SELECT menuId, categoryId, (SELECT name FROM menu WHERE id=menuId) AS menu, (SELECT categoryName FROM menu_category WHERE menuId=menuId AND id=categoryId) AS category, COUNT(*) AS total_times_ordered FROM food_order_item GROUP BY menuId, categoryId ORDER BY total_times_ordered DESC LIMIT 5;
        const [result] = await db.query("SELECT menuId, categoryId, (SELECT name FROM menu WHERE id=menuId) AS menu, (SELECT categoryName FROM menu_category WHERE menuId=menuId AND id=categoryId) AS category, COUNT(*) AS total_times_ordered FROM food_order_item GROUP BY menuId, categoryId ORDER BY total_times_ordered DESC LIMIT 5");
       
        res.status(200).json({message: 'success', data: result});

    } catch (err) {
        console.log(err);
        next(err);
    }
}

// get a customer ordered foods

const getAllFoodOrdersOfCustomer = async (req, res, next) => {
    const role = req.query.role === 'Customer' ? 'Customer' : 'Employee';
   
    if(role==='Customer'){
        try {
            const [foodOrders] = await db.query("SELECT * FROM food_order WHERE customerId=?", [+req.user.id]);
    
            // for each food order we have to populate food items
            for(let i = 0; i < foodOrders.length; i++) {
                const order = foodOrders[i]; // current order
                const [items] = await db.query("SELECT foi.mealName,foi.price,foi.quantity,m.name,m.image,c.categoryName from food_order_item foi INNER join menu_category c ON c.id=foi.categoryId INNER JOIN menu m ON m.id=c.menuId WHERE foi.orderId=?", [+order.id]);
            
                // add those items into each food order
                foodOrders[i].items = items;
            }
            console.log(foodOrders);
            res.status(200).json({message: 'success', orders: foodOrders});
        } catch (err) {
            next(err);
           
        }
    }
    if(role==='Employee'){
        try {
            const [foodOrders] = await db.query("SELECT e.*,CONCAT(c.firstName , ' ' ,c.lastName) As name,CONCAT(c.address, ' ' ,c.street, ' ' , c.city) As address,c.phone,c.gender FROM food_order e INNER JOIN customer c ON c.id=e.customerId");
           
            // for each food order we have to populate event items
            for(let i = 0; i < foodOrders.length; i++) {
                const order = foodOrders[i]; // current order
                const [items] = await db.query("SELECT foi.mealName,foi.price,foi.quantity,m.name,m.image,c.categoryName from food_order_item foi INNER join menu_category c ON c.id=foi.categoryId INNER JOIN menu m ON m.id=c.menuId WHERE foi.orderId=?", [+order.id]);
               
                // add those items into each food order
                foodOrders[i].items = items;
            }
            
            
            res.status(200).json({message: 'success', orders: foodOrders});
        } catch (err) {
            next(err);
            console.log(next(err))
           
        }
    }
    
}

module.exports = {
    createNewMenu,
    getAllMenus,
    deleteMenu,
    getSingleMenu,
    getSingleMenuUser,

    updateSingleMeal, // add new meal to a menu or remove a meal from a menu
    createNewOrder,
    getAllFoodOrdersOfCustomer,

    getPopularCategories
}