const db = require('../db.js');
const express = require('express');
const app = express();
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');
const SMS = require('../routes/SMS.JS');
const { name } = require('ejs');
const stripe = require('stripe')('sk_test_51PvxxIJld1DgOYtIrb7rhhiPaQf02wi8Dd1gyKyrvRlJFCXXxUQbJ5QiBN7kJSHg9VoiO5CnHCbXY5vCOoxGkrZe00OcuEDcD0');
// const sms = require('./SMS.JS');


app.get('/registration', (req, res) => {
    res.render('registration');
});


app.post('/registration', async (req, res) => {
    const data = req.body;
    req.session.email = data.email;
    try {
        // Hash the password
        // var hashedPassword = await bcrypt.hash(data.password, 10);

        // Insert user data into the database with hashed password
        await db.query('INSERT INTO signin (name,email,password) VALUES (?,?,?)', [data.name, data.email, data.password]);


        // Generate OTP
        const rand = Math.floor(100000 + Math.random() * 900000);
       // console.log(rand);

        // Set up email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "1322sv@gmail.com",
                pass: "cuzp hwcl pcsa octe",
            }
        });

        // Define email options
        const mailOptions = {
            from: '1322sv@gmail.com',
            to: `${data.email}`,
            subject: 'Your OTP',
            text: `Your OTP is ${rand}`,
        };

        // Send mail with the transporter
        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
                return res.status(500).send('Error sending email.');
            }

            console.log('Email sent:', info.response);

            // Update OTP in the database
            await db.query('UPDATE signin SET otp = ? WHERE email = ?', [rand, data.email]);

            // Redirect to the OTP page
            return res.redirect('/otp');
        });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Server Error.' });
    }
});

app.get('/otp', async(req, res) => {
    const data=req.body
    res.render('otp', {error:""});

});

app.post('/otp', async (req, res) => {
    const data = req.body;
    console.log(data);
    console.log(req.session.email);
    const [rows] = await db.query('SELECT otp FROM signin WHERE email = ?', [req.session.email]);
    const otp = rows.length > 0 ? rows[0].otp : null;
    console.log(otp);

    if ( otp== data.otp) {
        const user = await db.query('SELECT * FROM signin WHERE email = ?', [data.email]);
        req.session.user = user[0];
        // req.session.islogin = true;
        res.redirect('/login');
    } else {
        res.render('otp', { error: 'Wrong OTP' });
    }
})


const islogin = (req, res, next) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
}

app.get('/login', (req, res) => {
    req.session.islogin = false;  
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const rows = await db.query('SELECT * FROM signin WHERE email = ?', [email]);
        if (rows[0].length > 0) {
            const storedHash = rows[0][0].password;
            // const isValidPassword = await bcrypt.compare(password, storedHash);
            // if (isValidPassword) {
                const user = rows[0][0].id;
                req.session.user = user;
                req.session.islogin = true;
                if(storedHash === password)
                res.redirect('/');
            // } else {
                // res.render('login', { error: 'Email and password are incorrect' });
            // }
        } else {
            res.render('login', { error: 'Email and password are incorrect' });
        }
    } catch (err) {
        res.status(500).send('Error logging in');
    }
});
// app.post('/login', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const rows = await db.query('SELECT * FROM signin WHERE email = ?', [email]);
//         if (rows[0].length > 0) {
//             const storedPassword = rows[0][0].password;
//             if (password === storedPassword) {
//                 const user = rows[0][0].id;
//                 req.session.user = user;
//                 req.session.islogin = true;
//                 res.redirect('/');
//             } else {
//                 res.render('login', { error: 'Email and password are incorrect' });
//             }
//         } else {
//             res.render('login', { error: 'Email and password are incorrect' });
//         }
//     } catch (err) {
//         res.status(500).send('Error logging')}
//     });

app.get('/forgot',(req,res) =>{
    res.render('email');
})

app.post('/forgot', async (req, res) => {
    const data = req.body;
    console.log(data.password);
  
    if (!req.session.email) {
      return res.status(400).send('Session email is not set');
    }
  
    try {
      const [rows] = await db.query('UPDATE signin SET password = ? WHERE email = ?', [data.password, req.session.email]);
      res.redirect('/login');
    } catch (error) {
      console.error('Database query failed:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
app.get('/forget_otp',(req,res)=>{  
    res.render('forget_otp',{error:""});
})

app.post('/forget_otp',async(req,res)=>{
    const data = req.body;
    console.log(req.session.email);
    const [rows] = await db.query('SELECT otp FROM signin WHERE email = ?', [req.session.email]);
    const otp = rows.length > 0 ? rows[0].otp : null;
    console.log(otp);

    if ( otp== data.otp) {
        res.redirect('/reset_password');
    } else {
        res.render('otp', { error: 'Wrong OTP' });
    }
})

app.get('/reset_password',(req,res)=>{
    res.render('forgot');
})


app.post('/reset_password',async(req,res)=>{
    
})

app.post('/email', async (req, res) => {
    const data = req.body;
    req.session.email=data.email;
    const random = Math.floor(100000 + Math.random() * 900000);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "1322sv@gmail.com",
            pass: "cuzp hwcl pcsa octe",
        }
    });

    const mailOptions = {
        from: '1322sv@gmail.com',
        to: `${data.email}`,
        subject: 'Your OTP',
        text: `Your OTP is ${random}`,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
            return res.status(500).send('Error sending email.');
        }

        console.log('Email sent:', info.response);
        console.log(random);
        //update the otp in the database
        await db.query('UPDATE signin SET otp = ? WHERE email = ?', [random, data.email]);
        res.redirect('/forget_otp');
    });
});

app.get('/', (req, res) => {
    res.render('mb');
});


app.get('/allproducts', (req, res) => {
    res.render('cat');
});

app.get('/authenticity', (req, res) => {
    res.render('yea');
});

   app.post('/authenticity', async (req, res) => {
    const data = req.body;
    // console.log(data);
    const rows = await db.query('SELECT number FROM auth WHERE number = ?', [data.number]);
    // console.log(rows);
    if (rows[0].length > 0) {
        SMS("9817411503","Your PRoduct is Authenticated. Thanks for Purchsing From MuscleBlast.")
        res.render('yea', { message: 'Product is authentic' }); 
    } else {
        SMS("9817411503","Your PRoduct is Not Authenticated.")
        res.render('yea', { message: 'Product is not authentic' });
    }
});


app.get('/story', (req, res) => {
    res.render('story');
});

app.get('/category/:id',islogin, async(req, res) => {
    const categoryId = req.params.id;
    const Product =  await db.query('SELECT * FROM product WHERE categoryid = ?', [categoryId]);
    res.render('category',{products:Product[0]});
});

    
app.get('/cart/:id', async(req, res) =>{
    // console.log(req.session.user);
    const id = req.params.id;
    await db.query('INSERT INTO cart (productid,userid,quantity) VALUES (?,?,?)', [id,req.session.user,1])
  
    const product =  await db.query('SELECT * FROM product WHERE id = ?', [id]);
    const Product=product[0][0];
    // const cartItems = await db.query('SELECT * FROM cart WHERE userid = ?', [req.session.user]);
    const cartItems = await db.query(`
  SELECT c.*, p.*
  FROM cart c
  JOIN product p ON c.productid = p.id
  WHERE c.userid = ?
`, [req.session.user]);
    const totalPrice =(cartItems[0].reduce((acc, item) => acc + item.quantity * item.price, 0));
    res.render('cart',{cartItems:cartItems[0],totalPrice : totalPrice});
})
app.get('/cart',islogin, async(req, res) => {
    const cartItems = await db.query(`
    SELECT c.*, p.*
    FROM cart c
    JOIN product p ON c.productid = p.id
    WHERE c.userid = ?
  `, [req.session.user]);
      const totalPrice =(cartItems[0].reduce((acc, item) => acc + item.quantity * item.price, 0));
       res.render('cart',{cartItems:cartItems[0],totalPrice : totalPrice});
   
})

app.get('/remove/:id',async(req,res)=>{
    const id = req.params.id;
    await db.query('DELETE FROM cart WHERE cartid = ? and userid=?', [id,req.session.user]);
    res.redirect('/cart');
})

app.get('/increase/:id',async(req,res)=>{
    const id = req.params.id;
    await db.query('UPDATE cart SET quantity = quantity + 1 WHERE cartid = ? and userid=?', [id,req.session.user]);
    res.redirect('/cart');
})

app.get('/decrease/:id', async (req, res) => {
    const id = req.params.id;
    await db.query('UPDATE cart SET quantity = quantity - 1 WHERE cartid = ? and userid=?', [id, req.session.user]);
    const cartItem = await db.query('SELECT quantity FROM cart WHERE cartid = ? and userid=?', [id, req.session.user]);
    if (cartItem[0][0].quantity === 0) {
      res.redirect(`/remove/${id}`);
    } else {
      res.redirect('/cart');
    }
  });

  app.get('/checkout',islogin, async (req, res) => {
    try {
        const userId = req.session.user;

        // Fetch cart items for the logged-in user, joining with the book table to get book details
        const cartItems = await db.query(`
        SELECT c.*, p.*
        FROM cart c
        JOIN product p ON c.productid = p.id
        WHERE c.userid = ?
      `, [userId]);
        console.log(cartItems[0]);
        // If the cart is empty, handle the case (e.g., redirect or send a message)
        if (cartItems[0].length === 0) {
            return res.render('error', { message: "Your cart is empty" });
        }

        // Calculate total amount and prepare line_items for Stripe
        const lineItems = cartItems[0].map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name, 
                },
                unit_amount: Math.round(item.price * 100) 
            },
            quantity: item.quantity // 'quantity' from the 'cart' table
        }));

        // Calculate total amount
        const totalAmount = (cartItems[0].reduce((acc, item) => acc + item.quantity * item.price, 0));
        console.log(totalAmount);
        // Create a Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            line_items: lineItems,
            mode: 'payment',
            shipping_address_collection: {
                allowed_countries: ['IN'],
            },
            success_url: 'http://localhost:8000/complete?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:8000/cancel?session_id={CHECKOUT_SESSION_ID}',
        });

        const sessionId = session.id;
        const successUrl = session.success_url.replace('{CHECKOUT_SESSION_ID}', sessionId);
        const cancelUrl = session.cancel_url.replace('{CHECKOUT_SESSION_ID}', sessionId);

        await db.query('INSERT INTO transaction (userid, transactionid, amount, payment_status) VALUES (?, ?, ?, ?)', [
            userId,
            session.id,
            totalAmount,
            'pending'
        ]);

        // Redirect to the Stripe checkout page
        res.redirect(session.url);
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).send('An error occurred during checkout.');
    }
});


app.get('/complete',islogin, async (req, res) => {
    const sessionId = req.query.session_id;
    const userId = req.session.user;
    const cartItems = await db.query(`
    SELECT c.*, p.*
    FROM cart c
    JOIN product p ON c.productid = p.id
    WHERE c.userid = ?
  `, [userId]);
  console.log(cartItems);
    // Insert cart items into orders table
    await Promise.all(cartItems[0].map(async (item) => {
        await db.query(`
          INSERT INTO orders (user_id, product_id, quantity, price) 
          VALUES (?, ?, ?, ?)
        `, [userId, item.productid, item.quantity, item.price]);
    }));
    await db.query('UPDATE transaction SET payment_status = "success" WHERE transactionid = ?', [sessionId]);
    await db.query('delete from cart where userid=?', [req.session.user]);
    res.render("payment", { message: "success" })
})

app.get('/cancel', islogin, async (req, res) => {
    const sessionId = req.query.session_id
    await db.query('UPDATE transaction SET payment_status = "cancelled" WHERE transactionid = ?', [sessionId]);
    res.redirect('payment', { message: "cancelled" })
});

app.get('/search', async (req, res) => {
    app.render('search');
})

app.post('/search', async (req, res) => {
    const searchTerm = req.body.name;
    const products = await db.query('SELECT * FROM product WHERE name = ?',`${searchTerm}`);
    res.render('cart', { products: products[0] });
})

module.exports = app;