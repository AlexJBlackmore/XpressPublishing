// Import express and create artists router
const express = require('express');
const seriesRouter = express.Router();

// Import sqlite3 and open DB instance
const sqlite3 = require('sqlite3');
db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Import issues router and mount
const issuesRouter = require('./issues');
seriesRouter.use('/:seriesId/issues', issuesRouter)

// Param handler
seriesRouter.param('seriesId', (req, res, next, id) => {
    const sql = "SELECT * FROM Series WHERE Series.id = $id";
    const placeholders = {$id: id};
    
    db.get(sql, placeholders, (err, row) => {
        if(err) {
            next(err);
        } else if(!row) {
            res.sendStatus(404);
        } else {
            req.series = id;
            next();
        }
    });
});

// Routes

// Get all
seriesRouter.get('/', (req, res, next) => {
    const sql = "SELECT * FROM Series";
    
    db.all(sql, (err, rows) => {
        if(err) {
            next(err);
        } else {
            // WHat is plural of series?
            res.status(200).json({series: rows})
        }
    });
});

// Get one
seriesRouter.get('/:seriesId', (req, res, next) => {
    const sql = "SELECT * FROM Series WHERE Series.id = $id";
    const placeholders = {$id: req.series};

    db.get(sql, placeholders, (err, row) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({series: row});
        }
    });
});

// Post
seriesRouter.post('/', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;

    if(!name || !description) {
        return res.sendStatus(400);
    }
    
    const sql = "INSERT INTO Series (name, description) VALUES ($name, $description)";
    const placeholders = {$name: name, $description: description};

    db.run(sql, placeholders, function(err) {
        if(err) {
            next(err);
        } else {
            db.get("SELECT * FROM Series WHERE Series.id = $id", {$id: this.lastID}, (err, row) => {
                if(err) {
                    next(err);
                } else if(!row) {
                    res.sendStatus(400);
                } else {
                    res.status(201).json({series: row});
                }
            });
        }
    });
});

// Put
seriesRouter.put('/:seriesId', (req, res, next) => {
    const name = req.body.series.name,
        description = req.body.series.description;
    if(!name || !description) {
        return res.sendStatus(400);
    }
    
    const sql = "UPDATE Series SET name = $name, description = $description WHERE Series.id = $id";
    const placeholders = {
        $name: name, 
        $description: description, 
        $id: req.series
    };

    db.run(sql, placeholders, (err) => {
        if(err) {
            next(err);
        } else {
            db.get("SELECT * FROM Series WHERE Series.id = $id", {$id: req.series}, (err, row) => {
                if(err) {
                    next(err);
                } else if(!row) {
                    res.sendStatus(400);
                } else {
                    res.status(200).json({series: row});
                }
            });
        }
    });
});

// Delete
// seriesRouter.delete('/:seriesId', (req, res, next) => {
//     const sql = "DELETE FROM Series WHERE Series.id = $seriesId";
//     const placeholders = {$seriesId: req.series};
//     db.run(sql, placeholders, (err) => {
//         if(err) {
//             next(err);
//         } else {
//             res.sendStatus(204);
//         }
//     });
// });

seriesRouter.delete('/:seriesId', (req, res, next) => {
    const issueSql = 'SELECT * FROM Issue WHERE Issue.series_id = $seriesId';
    const issueValues = {$seriesId: req.series};
    db.get(issueSql, issueValues, (error, issue) => {
      if (error) {
        next(error);
      } else if (issue) {
        res.sendStatus(400);
      } else {
        const deleteSql = 'DELETE FROM Series WHERE Series.id = $seriesId';
        const deleteValues = {$seriesId: req.seriesId};
  
        db.run(deleteSql, deleteValues, function(error) {
          if (error) {
            next(error);
          } else {
            res.sendStatus(204);
          }
        });
      }
    });
  });

module.exports = seriesRouter;