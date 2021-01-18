// Import express and create artists router
const express = require('express');
const artistsRouter = express.Router();

// Import sqlite3 and open DB instance
const sqlite3 = require('sqlite3');
db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Routes

// Param call to check if artist exists or not. If exists, add id to req body. Else send error.
artistsRouter.param('artistId', (req, res, next, id) => {
    // In hints it has Artist.id (not id at column 40 below)
    db.get("SELECT * FROM Artist WHERE id = $id", {$id: id}, (err, artist) => {

        // In hints it is writed with else if (may be better?)
        if(err) {
            next(err);
        } else {
            if(artist) {
                // SHould this be req.body.artist?
                req.artist = id;
                next();
            } else {
                res.sendStatus(404);
            }
            
        }
    });
});

// Get all
artistsRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Artist WHERE is_currently_employed = 1", (err, artists) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({artists: artists});
        }
    });
});

// Get one
artistsRouter.get('/:artistId', (req ,res, next) => {
    db.get("SELECT * FROM Artist WHERE id = $id", {$id: req.artist}, (err, artist) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({artist: artist});
        }
    });
});

// Post
artistsRouter.post('/', (req, res, next) => {

    const name = req.body.artist.name,
        dateOfBirth = req.body.artist.dateOfBirth,
        biography = req.body.artist.biography,
        isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
    
    if(!name || !dateOfBirth || !biography) {
        return res.sendStatus(400);
    }
    
    const sql = `INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) 
    VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)`;
    // My placeholders slightly diff to hints
    const placeholders = {
        $name: name, 
        $dateOfBirth: dateOfBirth, 
        $biography: biography, 
        $isCurrentlyEmployed: isCurrentlyEmployed
    };
    
    db.run(sql, placeholders, function(err) {
        if(err) {
            next(err);
        } else {
            db.get("SELECT * FROM Artist WHERE id=$id", {$id: this.lastID}, (err, row) => {
                if(err) {
                    next(err);
                } else {
                    return res.status(201).json({artist: row});
                }
            });
        }
    })
});

// Put
artistsRouter.put('/:artistId', (req, res, next) => {
    const name = req.body.artist.name,
        dateOfBirth = req.body.artist.dateOfBirth,
        biography = req.body.artist.biography,
        isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
    
    if(!name || !dateOfBirth || !biography) {
        return res.sendStatus(400);
    }

    const sql = 'UPDATE Artist ' 
    + 'SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed ' 
    + 'WHERE Artist.id = $id';

    const placeholders = { 
        $name: name, 
        $dateOfBirth: dateOfBirth, 
        $biography: biography, 
        $isCurrentlyEmployed: isCurrentlyEmployed,
        $id: req.artist};
    
    db.run(sql, placeholders, (err) => {
        if(err) {
            next(err);
        } else {
            db.get("SELECT * FROM Artist WHERE Artist.id = $id", {$id: req.artist}, (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(200).json({artist: row});
                }
            });
        }
    });
});

// Delete
artistsRouter.delete('/:artistId', (req, res, next) => {
    
    const sql = 'UPDATE Artist ' 
    + 'SET is_currently_employed = 0 ' 
    + 'WHERE Artist.id = $id'
    
    db.run(sql, {$id: req.artist}, (err) => {
        if(err) {
            next(err);
        } else {
            db.get("SELECT * FROM Artist WHERE Artist.id = $id", {$id: req.artist}, (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(200).json({artist: row});
                }
            });
        }
    });
});

module.exports = artistsRouter;