const express = require('express')
const router = express.Router()
const Menu = require('../models/menu')
const ErrorResponse = require('../helper/ErrorResponse')

// GET route for reading data
router.get('/:role', (req, res, next) => {
    Menu.aggregate(
        [
            {
              '$unwind': {
                'path': '$roles', 
                'preserveNullAndEmptyArrays': true
              }
            }, {
              '$match': {
                'roles': req.params.role
              }
            }
          ]
    ).then(menu => {
        res.send(treeGenerator(menu,null))
    }).catch(err => {
        next(ErrorResponse.create(err, 500))
    })
    // Menu.find({
    //     roles: {
    //         $all: [req.params.role]
    //     }
    // }).then(menu => {
    //     res.send(menu)
    // }).catch(err => {
    //     next(ErrorResponse.create(err, 500))
    // })
})

const treeGenerator = function (thisdata, root) {
    function setCount(object) {
        //return object.children ? (object.count = object.children.reduce((acc, curr) => acc + 1 + setCount(curr),0)) : 0;
        if (object.children) {
            object.count = object.children.length
            object.children.forEach(c => setCount(c))
        }
        return
    }
    let t = {}
    thisdata.forEach(o => {
        Object.assign((t[o.mIndex] = t[o.mIndex] || {}), o)
        t[o.parentIndex] = t[o.parentIndex] || {}
        t[o.parentIndex].children = t[o.parentIndex].children || []
        t[o.parentIndex].children.push(t[o.mIndex])
        if (o.parentIndex === root)
            t[o.mIndex].root = true
    })
    setCount(t[root])
    return t[root].children
};

module.exports = router;