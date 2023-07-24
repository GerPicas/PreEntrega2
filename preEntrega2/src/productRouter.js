const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const sort = req.query.sort === 'desc' ? -1 : 1;
        const query = req.query.query || {};

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);
        const hasPrevPage = page > 1;
        const hasNextPage = page < totalPages;

        const skip = (page - 1) * limit;

        const products = await Product.find(query)
            .limit(limit)
            .skip(skip)
            .sort({ price: sort });

        res.json({
            status: 'success',
            payload: products,
            totalPages,
            prevPage: hasPrevPage ? page - 1 : null,
            nextPage: hasNextPage ? page + 1 : null,
            page,
            hasPrevPage,
            hasNextPage,
            prevLink: hasPrevPage ? `/api/products?limit=${limit}&page=${page - 1}` : null,
            nextLink: hasNextPage ? `/api/products?limit=${limit}&page=${page + 1}` : null,
        });
    } catch (err) {
        console.error('Error getting products:', err);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

// GET /api/products/:pid
router.get('/:pid', async (req, res) => {
    try {
        const product = await Product.findById(req.params.pid);
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Product not found' });
        }
        res.json({ status: 'success', payload: product });
    } catch (err) {
        console.error('Error getting product by ID:', err);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

// POST /api/products
router.post('/', async (req, res) => {
    try {
        // Assuming req.body contains all the necessary fields for a new product.
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ status: 'success', payload: newProduct });
    } catch (err) {
        console.error('Error creating a new product:', err);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});

module.exports = router;
