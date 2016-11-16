const hasEqualMethod = (obj) => Object.prototype.hasOwnProperty( obj, 'equal' )

const hasToJSMethod = (obj) => Object.prototype.hasOwnProperty( obj, 'toJS' )

class List {
	static isList( lst ) {
		return lst instanceof List
	}

	static isNil( lst ) {
		return lst === List.Nil
	}

	static of( ...col ) {
		if ( col instanceof Array ) {
			return List.fromArray( col );
		} else {
			let out = List.Nil;
			for ( v of col ) {
				out = out.unshift( v )
			}
			return out.reverse()
		}
	}

	static fromArray( arr ) {
		if ( arr instanceof Array ) {
			return arr.reduceRight( (acc,v) => acc.unshift( List.fromArray( v )), List.Nil )
		} else {
			return arr
		}
	}

	static equalLists( lst1, lst2 ) {
		if ( lst1 === lst2 ) {
			return true
		} else if ( List.isList( lst1 ) && List.isList( lst2 )) {
			return List.equalLists( lst1.first(), lst2.first()) && List.equalLists( lst1.shift(), lst2.shift())
		} else if ( List.isList( lst1 ) || List.isList( lst2 )) {
			return false
		} else if ( hasEqualMethod( lst1 )) {
			return lst1.equal( lst2 )
		} else {
			return false
		}
	}

	toArray() {
		return this.reduce( (acc,v) =>	{acc.push( List.isList(v) ? v.toArray() : v ); return acc}, [] )
	}

	toJS() {
		return this.reduce( (acc,v) => {acc.push( hasToJSMethod(v) ? v.toJS() : v ); return acc}, [] )
	}

	constructor( h, t ) {
		this.h = h
		this.t = t
	}

	unshift( ...v ) {
		let result = this
		for ( let i = v.length-1; i >= 0; i-- ) {
			result = new List( v[i], result )
		}
		return result
	}

	shift() {
		return this.t
	}

	pop() {
		return this.reverse().shift().reverse()
	}

	push( ...v ) {
		return List.fromArray( v ).reduce( (acc,v) => acc.unshift(v), this.reverse() ).reverse()
	}

	first() {
		return this.h
	}

	last() {
		let lst = this
		while ( !lst.shift().isNil()){
			lst = lst.shift()
		}
		return lst.first()
	}

	clear() {
		return List.Nil
	}

	isNil() {
		return this === List.Nil
	}

	reduceWhile( f, acc ) {
		let lst = this
		let ok = true
		let i = 0
		while ( ok && !lst.isNil()) {
			[ok,acc] = f( acc, lst.first(), i++, lst )
			lst = lst.shift()
		}
		return acc
	}

	reduce( f, acc ) {
		let lst = this
		let i = 0
		while ( !lst.isNil()) {
			acc = f( acc, lst.first(), i++, lst )
			lst = lst.shift()
		}
		return acc
	}
	
	reverse() {
		return this.reduce( (acc,v) => acc.unshift(v), List.Nil )
	}

	reduceRight( f, acc ) {
		return this.reverse().reduce( f, acc )
	}

	mapReverse( f ) {
		return this.reduce( (acc,v,i,lst) => acc.unshift( f(v,i,lst)), List.Nil )
	}

	map( f ) {
		return this.mapReverse( f ).reverse()
	}

	filterReverse( p ) {
		return this.reduce( (acc,v,i,lst) => p(v,i,lst) ? acc.unshift(v) : acc, List.Nil )
	}

	filter( p ) {
		return this.filterReverse( p ).reverse()
	}

	every( p ) {
		return this.reduceWhile( (acc,v,i,lst) => !p(v,i,lst) ? [false,false] : [true,true], true ) 
	}

	some( p ) {
		return this.reduceWhile( (acc,v,i,lst) => p(v,i,lst) ? [false,true] : [true,false], false ) 
	}

	find( p ) {
		return this.reduceWhile( (acc,v,i,lst) => p(v,i,lst) ? [false,v] : [true,undefined], undefined )
	}

	count( p ) {
		return this.reduce( (acc,v,i,lst) => p(v,i,lst) ? acc + 1 : acc, 0 )
	}

	sum() {
		return this.reduce( (acc,v) => acc + v, 0 )
	}

	get length() {
		return this.count( (v) => true )
	}

	slice( begin, end ) {
		if ( (begin === undefined && end === undefined) || begin === 0 ) {
			return this
		} else if ( end === undefined ) {
			end = Number.POSITIVE_INFINITY
		}

		if ( begin === end || (begin >= 0 && begin >= end) || (begin < 0 && begin >= end )) {
			return List.Nil
		}

		if ( begin < 0 || end < 0 ) {
			var len = this.length;
			begin = begin < 0 ? begin + len : begin
			end = end < 0 ? end + len : end
			begin = begin < 0 ? 0 : begin
			end = end < 0 ? 0 : end
			if ( begin === end ) {
				return List.Nil
			}
		}

		let from = this
		for ( let i = 0; i < begin && !from.isNil(); i++ ) {
			from = from.shift()
		}
		let result = List.Nil
		for ( let i = 0; i < end-begin && !from.isNil(); i++ ) {
			result = result.unshift( from.first())
			from = from.shift()
		}
		return result.reverse()
	}

	concatReversed( lst ) {
		return this.reduce( (acc,v) => acc.unshift(v), lst )
	}

	concat( lst ) {
		return lst.concatReversed( this.reverse() ).reverse()
	}

	concatHead( lst ) {
		return lst.reverse().concatReversed( this )
	}

	flatten() {
		if ( this.isNil()) {
			return this
		} else {
			return this.reduceRight( (acc,v) => (List.is( v )) ? v.flatten().concat( acc ) : acc.unshift(v), List.Nil )
		}
	}

	partition( p ) {
		return [this.filter(p), this.filter( (v,i,lst) => !p(v,i,lst))]
	}

	get( index ) {
		let lst = this
		if ( index < 0 ) {
			index = this.length + index
		}
		while (!lst.isNil() && index-- > 0) {
			lst = lst.shift()	
		}
		return lst.first()
	}
	
	merge( lst, cmp ) {
		if ( this.isNil()) {
			return lst 
		} else if (lst.isNil()) {
			return this;
		} else {
			if ( cmp( this.first(), lst.first())) {
				return new List( this.first(), this.shift().merge( lst, cmp ))
			} else {
				return new List( lst.first(), this.merge( lst.shift(), cmp ))
			}
		}
	}

	doSort( part, cmp ) {
		if ( part.isNil()) {
			if ( this.shift().isNil()) {
				return this.first()
			} else {
				return part.doSort( this, cmp )
			}
		} else {
			if ( part.shift().isNil()) {
				return new List( part.first(), this ).doSort( part.shift(), cmp )
			} else {
				return new List( part.first().merge( part.shift().first(), cmp ), this ).doSort( part.shift().shift(), cmp )
			}
		}
	}

	sort( cmp ) {
		cmp = cmp === undefined ? ((a,b) => a < b) : cmp
		return List.Nil.doSort( this.map((v) => List.Nil.unshift(v)), cmp )
	}

	static range( init, limit, step ) {
		let lst = List.Nil
		if ( init === undefined ) {
			return lst
		}
		if ( limit === undefined ) {
			limit = init
			init = 0
		}
		step = !step ? 1 : step//(init > limit ? -1 : 1) : step
		if (((init > limit && step < 0) || (init < limit && step > 0)) && step !== 0 ) {
			if ( step < 0 ) {
				for ( let i = init; i > limit; i += step ) {
					lst = lst.unshift( i )
				}
			} else {
				for ( let i = init; i < limit; i += step ) {
					lst = lst.unshift( i )
				}
			}
		}
		return lst.reverse()
	}

	equal( lst ) {
		return List.equalLists( this, lst )
	}
}

List.Nil = new List(undefined,null)
List.Nil.t = List.Nil

module.exports = List
