const hooks = require( 'async_hooks' )

const cls = {}
let current = null
const HOLD = "$HOLD"

hooks
    .createHook( {
        init ( asyncId, type, triggerId ) {
            let existing = cls[ triggerId ] || {}
            cls[ asyncId ] = existing[HOLD] ? existing : { ...existing }
        },
        before ( id ) {
            current = cls[ id ]
        },
        after () {
            current = null
        },
        destroy ( id ) {
            delete cls[ id ]
        },
    } )
    .enable()

function getCurrent () {
    return current
}

module.exports = new Proxy( getCurrent, {
    get ( obj, prop ) {
        if ( prop === '$hold' ) return function(hold) {
            current[HOLD] = !!hold
        }
        if( prop=== '$init') return function() {
            current[HOLD] = true
        }
        if ( current ) {
            return current[ prop ]
        }

    },
    set ( obj, prop, value ) {
        if ( current ) {
            current[ prop ] = value
        }
        return true
    },
    has ( obj, prop ) {
        return prop in current
    },
} )


