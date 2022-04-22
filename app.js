// Dependancies
    const express = require('express');
    const expressLayouts = require('express-ejs-layouts');

// Global variables
    const port = process.env.PORT || 3000;

// App config
    const app = express();

    app.set('view engine', 'ejs');
    app.set('views', `${__dirname}/views`);
    app.set('layout', 'layout/layout');

    app.use(expressLayouts);
    app.use(express.static('public'));

    app.listen(port, err => console.log(err || `Pizza legends started on port ${port}`));

    app.get('/', (request, response) => response.render('index'));