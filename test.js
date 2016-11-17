const List = require('./List.js')
const assert = require('assert');//.deepStrictEqual
const eq = assert.deepStrictEqual

eq( List.isNil( List.Nil ), true )
eq( List.isList( List.Nil ), true )
eq( List.isList( [1,2,3] ), false )
eq( List.of( 1, 2, 3 ), new List( 1, new List( 2, new List( 3, List.Nil))))
eq( List.of( 1, 2, 3 ).toJS(), [1,2,3] )
eq( List.equalLists( List.of( 1, 2, 3 ), List.of( 1, 2, 3 )), true )
eq( List.equalLists( List.of( 1, 2, 3 ), List.of( -1, 2, 3 )), false )
eq( List.of( 2, 3 ).unshift( 1 ), List.of( 1, 2, 3 ))
eq( List.of( 2, 3 ).unshift( 1, 2, 3 ), List.of( 1, 2, 3, 2, 3 ), true )
eq( List.of( 1, 2, 3 ).shift(), List.of( 2, 3 ))
eq( List.of( 1, 2, 3 ).first(), 1 )
eq( List.of( 1, 2, 3, 4 ).last(), 4 )
eq( List.of( 1, 2, 3, 4, 5 ).push( 6, 7 ), List.of( 1, 2, 3, 4, 5, 6 ,7 ))
eq( List.of( 1, 2, 3, 4, 5 ).pop(), List.of( 1, 2, 3, 4 ))
eq( List.of( 1, 2, 3, 4 ).reduceWhile( (acc,v,i,lst) => [v < 2, acc+v], 0 ), 3 )
eq( List.of( 1, 2, 3, 4 ).reduceWhile( (acc,v,i,lst) => [i !== 2, v], 0 ), 3 )
eq( List.of( 1, 2, 3, 4 ).reduce( (acc,v,i,lst) => acc + v, 0 ), 10 )
eq( List.of( 1, 2, 3, 4 ).reverse(), List.of( 4, 3, 2, 1 ))
eq( List.of( "1", "2", "3", "4" ).reduce( (acc,v) => acc + v, "" ), "1234" )
eq( List.of( "1", "2", "3", "4" ).reduceRight( (acc,v) => acc + v, "" ), "4321" )
eq( List.of( 1, 2, 3, 4 ).map( x => x * 2 ), List.of( 2, 4, 6, 8 ))
eq( List.of( 1, 2, 3, 4 ).map( (x,i) => i%2 === 0 ? x : 0 ), List.of( 1, 0, 3, 0 ))
eq( List.of( 1, 2, 3, 4 ).filter( (x) => x > 2 ), List.of( 3, 4 ))
eq( List.of( 1, 2, 3, 4 ).filter( (x,i) => i < 2 ), List.of( 1, 2 ))
eq( List.of( 1, 2, 3, 4 ).every( (x,i) => x >= 1 ), true )
eq( List.of( 1, 2, 3, 4 ).every( (x,i) => i < 5 ), true )
eq( List.of( 1, 2, 3, 4 ).every( (x,i) => x % 2 === 0 ), false )
eq( List.of( 1, 2, 3, 4 ).some( (x,i) => x === 3 ), true )
eq( List.of( 1, 2, 3, 4 ).some( (x,i) => i > 2 ), true )
eq( List.of( 1, 2, 3, 4 ).some( (x,i) => i < -1 ), false )
eq( List.of( 1, 2, 3, 4 ).find( (x,i) => x % 2 === 0 ), 2 )
eq( List.of( 1, 2, 3, 4 ).find( (x,i) => i > 2 ), 4 )
eq( List.of( 1, 2, 3, 4 ).find( (x,i) => x > 10 ), undefined )
eq( List.of( 1, 2, 3, 4 ).length, 4 )
eq( List.of( 1, 2, 3, 4, 5 ).count( (x) => x % 2 === 1), 3 )
eq( List.of( 1, 2, 3, 4, 5 ).slice(), List.of( 1, 2, 3, 4, 5 ))
eq( List.of( 1, 2, 3, 4, 5 ).slice( 1 ), List.of( 2, 3, 4, 5 ))
eq( List.of( 1, 2, 3, 4, 5 ).slice( 1, 2 ), List.of(2))
eq( List.of( 1, 2, 3, 4, 5 ).slice( 2, 2 ), List.Nil )
eq( List.of( 1, 2, 3, 4, 5 ).slice( 3, 2 ), List.Nil )
eq( List.of( 1, 2, 3, 4, 5 ).slice( 2, 4 ), List.of( 3, 4 ))
eq( List.of( 1, 2, 3, 4, 5 ).slice( -1 ), List.of( 5 ))
eq( List.of( 1, 2, 3, 4, 5 ).slice( -2 ), List.of( 4, 5 ))
eq( List.of( 1, 2, 3, 4, 5 ).slice( -2, -1 ), List.of( 4 ))
eq( List.of( 1, 2, 3, 4, 5 ).slice( -2, -4 ), List.Nil )
eq( List.of( 1, 2, 3, 4, 5 ).slice( -2, 4 ), List.of( 4 ))
eq( List.of( 1, 2, 3, 4 ).sum(), 10 )
eq( List.of( 1, 2, 3, 4 ).concat( List.of( 5, 6 )), List.of( 1, 2, 3, 4, 5, 6 ))
eq( List.of( 3, 4, 5 ).concatHead( List.of( 1, 2 )), List.of( 1, 2, 3, 4, 5 ))
eq( List.of( 1, 2, 3, 4, 5 ).partition( (v,i) => v > 3 ), [List.of( 4, 5 ), List.of( 1, 2, 3 )] )
eq( List.of( 1, 2, 3, 4, 5 ).partition( (v,i) => i < 1 ), [List.of( 1 ), List.of( 2, 3, 4, 5 )] )
eq( List.of( 1, 2, 3, 4, 5 ).get( 0 ), 1 )
eq( List.of( 1, 2, 3, 4, 5 ).get( 2 ), 3 )
eq( List.of( 1, 2, 3, 4, 5 ).get( -1 ), 5 )
eq( List.of( 1, 2, 3, 4, 5 ).get( -100 ), 1 )
eq( List.of( 1, 2, 4, 3, 5 ).sort(), List.of( 1, 2, 3, 4, 5 ))
eq( List.of( 4, 1, 2, 3, 5 ).sort(), List.of( 1, 2, 3, 4, 5 ))
eq( List.of( 1, 2, 3, 4, 5 ).sort( (a,b) => a > b), List.of( 5, 4, 3, 2, 1 ))
eq( List.range( 1 ), List.of( 0 ))
eq( List.range( 3 ), List.of( 0, 1, 2 ))
eq( List.range( -1 ), List.Nil )
eq( List.range( -5, 0 ), List.of( -5, -4, -3, -2, -1 ))
eq( List.range( 0, 10, -1 ), List.Nil )
eq( List.of( 1, 2, 3 ).equal( List.of( 1, 2, 3)), true )
eq( List.of( 1, 2, 3, 4 ).equal( List.of( 1, 2, 3)), false )
