// Import express and create issues router
const express = require('express');
const issuesRouter = express.Router({mergeParams: true});

// Import sqlite3 and open DB instance
const sqlite3 = require('sqlite3');
db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.param('issueId', (req, res, next, issueId) => {
    const sql = "SELECT * FROM Issues WHERE Issues.id = $issueId";
    const placeholders = {$issueId: issueId};
    db.get(sql, placeholders, (err, row) => {
        if(err) {
            next(err);
        } else if(!row) {
            res.sendStatus(404);
        } else {
            res.issue = issueId;
        }
    })
});


issuesRouter.get('/', (req, res, next) => {
    const sql = "SELECT * FROM Issue WHERE Issues.series_id = $seriesId";
    const placeholders = {$seriesId: req.params.seriesId};

    db.all(sql, (err, rows) => {
        if(err) {
            next(err);
        } else if (!rows) {
            return res.sendStatus(404);
        } else {
            res.status(200).json({issues: rows});
        }
    });
});

issuesRouter.post('/', (req, res, next) => {
    const name = req.body.issue.name,
        issueNumber = req.body.issue.issueNumber,
        publicationDate = req.body.issue.publicationDate,
        artistId = req.body.issue.artistId,
        seriesId = req.series;

    const artistDbSql = "SELECT * FROM Artist WHERE Artist.id = $artistId";
    const artistDbPlaceholders = {$artistId: artistId};

    db.get(artistDbSql, artistDbPlaceholders, (err, row) => {
        if(err) {
            next(err);
        } else {
            if(!name || !issueNumber || !publicationDate || !row) {
                return res.sendStatus(400);
            }
        
            const sql = `INSERT INTO Issue 
                (name, issue_number, publication_date, artist_id, series_id
                VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)`;
            const placeholders = {
                $name: name,
                $issueNumber: issueNumber,
                $publicationDate: publicationDate,
                $artistId: artistId,
                $seriesId: seriesId
            };
            db.run(sql, placeholders, (err) => {
                if(err) {
                    next(err);
                } else {
                    db.get("SELECT * FROM Issue WHERE Issue.id = $id", {$id: this.lastID}, (err, row) => {
                        if(err) {
                            next(err);
                        } else {
                            return res.status(201).json({issue: row});
                        }
                    })
                }
            });
        }
    });
});

issuesRouter.put('/:issueId', (req, res, next) => {
    const name = req.body.issue.name,
        issueNumber = req.body.issue.issueNumber,
        publicationDate = req.body.issue.publicationDate,
        artistId = req.body.issue.artistId,
        seriesId = req.series;

    const artistDbSql = "SELECT * FROM Artist WHERE Artist.id = $artistId";
    const artistDbPlaceholders = {$artistId: artistId};

    db.get(artistDbSql, artistDbPlaceholders, (err, row) => {
        if(err) {
            next(err);
        } else {
            if(!name || !issueNumber || !publicationDate || !row) {
                return res.sendStatus(400);
            }
        
            const sql = `UPDATE Issue 
                SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId, series_id = $seriesId
                WHERE Issue.id = $issueId`;
            const placeholders = {
                $name: name,
                $issueNumber: issueNumber,
                $publicationDate: publicationDate,
                $artistId: artistId,
                $seriesId: seriesId,
                $issueId: req.issue
            };
            db.run(sql, placeholders, function(err) {
                if(err) {
                    next(err);
                } else {
                    db.get("SELECT * FROM Issue WHERE Issue.id = $id", {$id: req.issue}, (err, row) => {
                        if(err) {
                            next(err);
                        } else {
                            return res.status(201).json({issue: row});
                        }
                    })
                }
            });
        }
    });
});

issuesRouter.delete('/:issueId', (req, res, next) => {
    const sql = `DELETE FROM Issue WHERE Issue.id = $issueId`;
    const placeholders = {$issueId: req.issue};

    db.run(sql, placeholders, (err) => {
        if(err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    });
});


module.exports = issuesRouter;